import { $ } from "bun";
import readline from "readline";
import { randomBytes } from "crypto";

// Build the readline interface.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Defines the async function to ask a question.
function rlQuestion(question: string) {
    return new Promise<string>((resolve) => {
        rl.question(question, resolve);
    });
}

// Check we have docker compose.
try {
    await $`docker compose --version`.throws(true).quiet();
} catch {
    console.error(
        "Please install Docker Compose. Is your version of Docker very outdated?",
    );
    process.exit(1);
}

// Log the logo.
console.log(`---------------------
| Cyno Server Setup |
---------------------
`);

// Figure out if this is a upgrade.
const upgrade = await Bun.file("docker-compose.generated.yml").exists();

// Handle the indentation.
function indent(content: string, space: string) {
    const s = content.split("\n");
    for (let i = 0; i < s.length; i++) {
        if (s[i].trim() === "") continue;
        s[i] = space + s[i];
    }
    return s.join("\n");
}

// Ask which option the user wants.
async function ask(question: string, options: string[]) {
    let value = question + "\n";
    for (let i = 0; i < options.length; i++) {
        value += `\n${i + 1}) ${options[i]}${i === 0 ? " (default)" : ""}`;
    }
    console.log(value + "\n");
    for (;;) {
        const answer = (
            await rlQuestion("Enter the number of the option you want: ")
        ).trim();
        if (answer === "") return options[0];
        if (isNaN(+answer)) continue;
        const a = +answer;
        if (a >= 1 && a <= options.length) return options[a - 1];
    }
}

// Build the Docker Compose configuration.
async function generateDockerCompose(
    turso: boolean,
    webServer: { type: "caddy"; ssl: boolean },
) {
    // Get the base template.
    let config = await Bun.file("scripts/compose/base.template.yml").text();

    // Handle the libsql configuration.
    if (turso) {
        config +=
            "\n" +
            indent(
                await Bun.file(
                    "scripts/compose/database/turso.template.yml",
                ).text(),
                "    ",
            );
    } else {
        config +=
            "\n" +
            indent(
                await Bun.file(
                    "scripts/compose/database/libsql-server.template.yml",
                ).text(),
                "    ",
            );
    }

    // Handle the caddy configuration.
    if (webServer.type === "caddy") {
        config +=
            "\n" +
            indent(
                await Bun.file(
                    `scripts/compose/web/caddy-${webServer.ssl ? "https" : "http"}.template.yml`,
                ).text(),
                "    ",
            );
    } else {
        config +=
            "\n" +
            indent(
                await Bun.file(
                    "scripts/compose/web/cloudflare.template.yml",
                ).text(),
                "    ",
            );
    }

    // Write the configuration.
    const w = Bun.file("docker-compose.generated.yml").writer();
    w.write(config);
    await w.end();
}

// Handle blank lines.
async function noBlankResponse(question: string) {
    for (;;) {
        const response = (await rlQuestion(question)).trim();
        if (response !== "") return response;
    }
}

if (upgrade) {
    // Log that we are upgrading!
    console.log(`Config detected - upgrading Cyno! 🚀
`);
} else {
    // Log that we are setting up the server.
    console.log(`No config detected - setting up Cyno! 🚀
`);

    // Defines the environment variables.
    const env: string[] = [];

    // Figure out how the user wants to deploy the database.
    const turso =
        (await ask("How do you want to deploy the database?", [
            "Use a locally deployed LibSQL server",
            "Use Turso to manage the database",
        ])) === "Use Turso to manage the database";
    if (turso) {
        // Get the URL.
        const url = await noBlankResponse(
            "Enter the connection URI for the LibSQL server (such as Turso): ",
        );
        env.push(`DATABASE_URL=${url}`);
        const authToken = (
            await rlQuestion(
                "Enter the auth token for the LibSQL server (can be blank): ",
            )
        ).trim();
        if (authToken !== "") env.push(`DATABASE_AUTH_TOKEN=${authToken}`);
    } else {
        // Use the local DB.
        env.push("DATABASE_URL=http://db:8000");
    }

    // Ask the user how they want to deploy the web server.
    const tls =
        (await ask("How do you want to deploy the web server?", [
            "Use Caddy to manage HTTPS and use ports 443/80",
            "Use Caddy to manage HTTP and expose on port 8080",
        ])) === "Use Caddy to manage HTTPS and use ports 443/80"
            ? { type: "caddy" as const, ssl: true }
            : { type: "caddy" as const, ssl: false };
    const hostname = await noBlankResponse(
        "Enter the hostname for the web server (for example: example.com): ",
    );
    env.push(
        `SITE_ADDRESS=${hostname}`,
        `DISCORD_REDIRECT_URI=https://${hostname}/api/auth/callback`,
    );

    // Log that we are going to setup Discord.
    console.log(`
Time to setup Discord! You will need to create a new application on the Discord Developer Portal.

You should set the redirect URI to https://${hostname}/api/auth/callback. I am going to ask some information about the application now.
`);
    const clientId = await noBlankResponse("Enter the client ID: ");
    const clientSecret = await noBlankResponse("Enter the client secret: ");
    const token = await noBlankResponse("Enter the bot token: ");
    env.push(
        `DISCORD_CLIENT_ID=${clientId}`,
        `DISCORD_CLIENT_SECRET=${clientSecret}`,
        `TOKEN=${token}`,
    );

    // Log that we are going to setup uploadthing.
    console.log(`
Now open uploadthing and go to your project then API Keys. Click the eye and then copy each bit as needed.
`);
    const utSecret = await noBlankResponse(
        "What is the uploadthing secret (the bit after UPLOADTHING_SECRET=): ",
    );
    const utAppId = await noBlankResponse(
        "What is the uploadthing app ID (the bit after UPLOADTHING_APP_ID=): ",
    );
    env.push(`UPLOADTHING_SECRET=${utSecret}`, `UPLOADTHING_APP_ID=${utAppId}`);

    // Add the cookie private key.
    const data = randomBytes(32).toString("hex");
    env.push(`COOKIE_PRIVATE_KEY=${data}`);

    // Generate the Docker Compose configuration and write the .env file.
    await generateDockerCompose(turso, tls);
    const w = Bun.file(".env").writer();
    w.write(env.join("\n") + "\n");
    await w.end();

    // Log that the configuration has been generated.
    console.log(`
Configuration generated! 🎉
`);
}

// Run the command.
async function runCommand(command: string, allowThrow?: boolean) {
    console.log(`📜 ${command}`);
    const r = await $`${{ raw: command }}`.throws(false);
    if (r.exitCode !== 0 && !allowThrow) process.exit(r.exitCode);
}

// Build the site and copy public.
await runCommand("docker build -t cyno-site -f Dockerfile.site .");
await runCommand("mkdir -p server_cfg/public/_next/static");
await runCommand(
    "docker run --rm -v ./server_cfg:/server_cfg cyno-site cp -r /home/node/app/site/public /server_cfg",
);
await runCommand(
    "docker run --rm -v ./server_cfg:/server_cfg cyno-site cp -r /home/node/app/site/.next/static /server_cfg/public/_next",
);

// If it is an upgrade, stop the containers.
if (upgrade) {
    await runCommand(
        "docker compose -f docker-compose.generated.yml down",
        true,
    );
}

// Start the containers whilst building the bot.
await runCommand(
    "docker compose -f docker-compose.generated.yml up -d --build",
);

// Handle commands migration by executing "npm run commands:migrate --workspace bot" in the bot compose container.
await runCommand(
    "docker compose -f docker-compose.generated.yml run bot npm run commands:migrate --workspace bot",
);

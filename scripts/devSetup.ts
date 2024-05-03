import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { randomBytes } from "crypto";
import { statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import readline from "readline";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function ensurePrivateKey() {
    const path = join(root, "site", "private.key");
    try {
        statSync(path);
        return;
    } catch {}

    console.log("Generating private cookie key.");
    const data = randomBytes(32).toString("hex");
    writeFileSync(path, data);
}

class AsyncAsk {
    private iface: readline.Interface;

    constructor() {
        this.iface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    async question(query: string) {
        for (;;) {
            const x = (
                await new Promise<string>((r) => this.iface.question(query, r))
            ).trim();
            if (x !== "") {
                return x;
            }
        }
    }
}

function runCommand(name: string, args: string[]) {
    const res = spawnSync(name, args, {
        stdio: "inherit",
        shell: process.env.SHELL || true,
        env: process.env,
    });
    if (res.error) throw res.error;
    if (res.status !== 0) process.exit(res.status!);
}

async function devQuestions() {
    const rl = new AsyncAsk();
    const clientId = await rl.question("What is the Discord client ID: ");
    const clientSecret = await rl.question(
        "What is the Discord client secret: ",
    );

    console.log(`
Ok great! Now click the Bot tab and click "Add Bot" if you haven't already. We need the token.

Also make sure to turn on the members intent.
`);
    const token = await rl.question("What is the Discord token: ");

    console.log(`
Ok great! Now open uploadthing and go to your project then API Keys. Click the eye and then copy each bit as needed.
`);
    const utSecret = await rl.question(
        "What is the uploadthing secret (the bit after UPLOADTHING_SECRET=): ",
    );
    const utAppId = await rl.question(
        "What is the uploadthing app ID (the bit after UPLOADTHING_APP_ID=): ",
    );

    const envFile = `DISCORD_REDIRECT_URI=http://localhost:5100/api/auth/callback
DATABASE_URL=file:../database.db
DISCORD_CLIENT_ID=${clientId}
DISCORD_CLIENT_SECRET=${clientSecret}
TOKEN=${token}
UPLOADTHING_SECRET=${utSecret}
UPLOADTHING_APP_ID=${utAppId}
`;
    writeFileSync(join(root, ".env"), envFile);
    console.log(`
.env file written! Running npm run db:migrate to setup the local database and npm run commands:migrate to setup bot commands.
`);
    runCommand("npm", ["run", "db:migrate"]);
    runCommand("npm", ["run", "commands:migrate"]);
    console.log(`
Setup complete!`);
    process.exit(0);
}

function devEnvSetup() {
    try {
        statSync(join(root, ".env"));
        return;
    } catch {
        console.log("No .env present - doing dev setup!");
    }

    console.log(`--------------------------------------
| Cyno Development Environment Setup |
--------------------------------------

We need 2 things to setup the development environment:

1) A Discord bot user (you can make one at https://discord.com/developers/applications).
2) A uploadthing user (you can make one at https://uploadthing.com - if you get redirected to Stripe, go back to the site, you do not need a paid plan for development).

Firstly, we need the client ID/secret for the Discord bot. You can find these under OAuth2 in your test bots application page. Whilst you are there, you should add the redirect URI of http://localhost:5100/api/auth/callback
`);

    devQuestions().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

ensurePrivateKey();
devEnvSetup();

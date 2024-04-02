import { $ } from "bun";

// Check we have docker compose.
try {
    await $`docker compose --version`.throws(true).quiet();
} catch {
    console.error("Please install Docker Compose.");
    process.exit(1);
}

// Run the command.
async function runCommand(command: string) {
    console.log(`📜 ${command}`);
    const r = await $`${{ raw: command }}`;
    if (r.exitCode !== 0) process.exit(r.exitCode);
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

// Log the logo.
console.log(`
---------------------
| Cyno Server Setup |
---------------------
`);

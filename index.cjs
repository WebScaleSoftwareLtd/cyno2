// Load environment variables.
require("dotenv").config();

// Build the client.
const { Client } = require("discord.js");
const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildMembers",
    ],
});

// Require the bundle.
let { default: setup, doMigrations } = require("./dist/bundle.cjs");
if (process.env.DB_MIGRATE === "1") {
    // Handle migrations.
    console.log("Starting migrations...");
    doMigrations().catch(e => {
        console.error(e);
        process.exit(1);
    });
    return;
}

// Handle setup generally.
let destruct = setup(client);
if (process.env.DEV === "1") {
    // Require fs and esbuild.
    const fs = require("fs");
    const esbuild = require("esbuild");

    // Handle process changes.
    fs.watch("./src", {
        recursive: true,
    }, async () => {
        // Log that there was a change.
        console.log("Change detected, rebuilding...");

        // Build the bundle.
        try {
            await esbuild.build({
                entryPoints: ["./src/index.ts"],
                bundle: true,
                minify: true,
                outfile: "./dist/bundle.cjs",
                sourcemap: true,
                target: "node18",
                platform: "node",
                external: ["better-sqlite3", "discord.js", "@libsql/client", "deasync"],
            });
        } catch {
            // esbuild logs the error, so we don't need to.
            return;
        }

        // Flush the require cache where ./dist/bundle.js is stored.
        delete require.cache[require.resolve("./dist/bundle.cjs")];
    
        // Re-require the bundle.
        setup = require("./dist/bundle.cjs").default;
    
        // Call the previous destructor.
        destruct();
    
        // Call the new setup function.
        destruct = setup(client);
    });
}

// Sign into Discord.
if (!process.env.TOKEN) throw new Error("No token provided");
client.login(process.env.TOKEN).catch(e => {
    console.error(e);
    process.exit(1);
});

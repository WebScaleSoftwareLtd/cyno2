"use strict";

// Require the bundle.
let { setup, getClient } = require("./dist/bundle.cjs");

// Handle setup generally.
(async () => {
    // Call the setup function.
    let destruct = await setup();

    if (process.env.DEV === "1") {
        // Require fs and esbuild.
        const fs = require("fs");
        const builder = require("./build.cjs").build;

        // Handle process changes.
        fs.watch(
            "./src",
            {
                recursive: true,
            },
            async () => {
                // Log that there was a change.
                console.log("Change detected, rebuilding...");

                // Build the bundle.
                try {
                    await builder();
                } catch {
                    // esbuild logs the error, so we don't need to.
                    return;
                }

                // Flush the require cache where ./dist/bundle.js is stored.
                delete require.cache[require.resolve("./dist/bundle.cjs")];

                // Re-require the bundle.
                setup = require("./dist/bundle.cjs").setup;

                // Call the previous destructor.
                destruct();

                // Call the new setup function.
                destruct = await setup();
            },
        );
    }

    // Sign into Discord.
    if (!process.env.TOKEN) throw new Error("No token provided");
    getClient()
        .login(process.env.TOKEN)
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
})().catch((e) => {
    console.error(e);
    process.exit(1);
});

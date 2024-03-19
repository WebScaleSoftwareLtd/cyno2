"use strict";

const esbuild = require("esbuild");

const build = (exports.build = () =>
    esbuild.build({
        entryPoints: ["./src/index.ts"],
        bundle: true,
        minify: true,
        outfile: "./dist/bundle.cjs",
        sourcemap: true,
        target: "node18",
        platform: "node",
        external: [
            "better-sqlite3",
            "discord.js",
            "react",
            "@libsql/client",
            "deasync",
        ],
    }));

if (require.main === module) build().catch(() => process.exit(1));

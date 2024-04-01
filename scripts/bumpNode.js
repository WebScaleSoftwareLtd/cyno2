"use strict";

const { readFile, writeFile } = require("fs/promises");
const { join } = require("path");

async function main() {
    const version = await (
        await fetch("https://resolve-node.vercel.app/lts")
    ).text();
    const root = join(__dirname, "..");
    await writeFile(join(root, ".nvmrc"), version + "\n");

    const dockerfiles = [
        "Dockerfile.bot", "Dockerfile.site",
    ];
    for (const dockerfile of dockerfiles) {
        const fp = join(root, dockerfile);
        const fileContents = (await readFile(fp, { encoding: "utf-8" })).toString();
        const [_, rest] = fileContents.split("\n", 2);
        await writeFile(fp, `FROM node:${version.substring(1)}-alpine
${rest}`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

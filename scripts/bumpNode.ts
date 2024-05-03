import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const version = await (
    await fetch("https://resolve-node.vercel.app/lts")
).text();
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
await writeFile(join(root, ".nvmrc"), version + "\n");

const dockerfiles = ["Dockerfile.bot", "Dockerfile.site"];
for (const dockerfile of dockerfiles) {
    const fp = join(root, dockerfile);
    const fileContents = (await readFile(fp, { encoding: "utf-8" })).toString();
    const a = fileContents.split("\n");
    a.shift();
    await writeFile(
        fp,
        `FROM node:${version.substring(1)}-bookworm
${a.join("\n")}`,
    );
}

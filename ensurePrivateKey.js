"use strict";

const { randomBytes } = require("crypto");
const { statSync, writeFileSync } = require("fs");
const { join } = require("path");

const path = join(__dirname, "site", "private.key");
try {
    statSync(path);
    return;
} catch {}

console.log("Generating private cookie key.");
const data = randomBytes(32).toString("hex");
writeFileSync(path, data);

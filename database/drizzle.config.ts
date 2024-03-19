import { config } from "dotenv";
import { join } from "path";
config({ path: join(__dirname, "..", ".env") });

import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not defined.");

export default {
    schema: "./schema.ts",
    out: "./drizzle",
    driver: "turso",
    dbCredentials: {
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    },
} satisfies Config;

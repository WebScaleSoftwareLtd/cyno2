export { client, setup } from "./client";
export * from "./schema";

import { Pool } from "@neondatabase/serverless";
import { client, setup } from "./client";

if (!client) {
    // Get the database URL.
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set!");

    // Create a libsql client.
    const pool = new Pool({ connectionString: url });

    // Call setup with this.
    setup(pool);
}

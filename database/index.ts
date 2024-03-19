export { client, setup } from "./client";
export * from "./schema";

import { createClient } from "@libsql/client";
import { client, setup } from "./client";
if (!client) {
    // Get the database URL.
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set!");

    // Create a libsql client.
    const client = createClient({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    // Call setup with this.
    setup(client);
}

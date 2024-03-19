// Setup the libsql client.
import { globalState } from "./state";
import { createClient } from "@libsql/client";
if (!globalState.databaseConnection) {
    // Get the database URL.
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set!");

    // Create a libsql client.
    const client = createClient({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    // Set the state to the client.
    globalState.databaseConnection = client;
}

// Setup the database module. We do this before all because it uses a sub-module and a global in our hot reloading.
import { setup } from "database/client";
import type { Client } from "discord.js";
setup(globalState.databaseConnection);

// Import the setup. Force the bundler to import this later.
const setupImport = import("./setup");
export default async (client: Client) => (await setupImport).default(client);

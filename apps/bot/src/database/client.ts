import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { globalState } from "../state";
import * as schema from "./schema";

if (!globalState.databaseConnection) {
    // Get the database URL.
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not defined.");

    // Create a Turso client.
    const client = createClient({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    // Set the state to the client.
    globalState.databaseConnection = client;
}

// Return the database connection.
export const client = drizzle(globalState.databaseConnection!, { schema });

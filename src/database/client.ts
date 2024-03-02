import { createClient } from "@libsql/client";
import { drizzle as libsqlDrizzle } from "drizzle-orm/libsql";
import { drizzle as betterSqliteDrizzle } from "drizzle-orm/better-sqlite3";
import { globalState } from "../state";
import * as schema from "./schema";
import path from "path";
import { mkdirSync } from "fs";
import BetterSQLite3 from "better-sqlite3";

if (!globalState.databaseConnection) {
    // Get the database URL.
    const url = process.env.DATABASE_URL;
    if (url) {
        // Create a libsql client.
        const client = createClient({
            url,
            authToken: process.env.DATABASE_AUTH_TOKEN,
        });

        // Set the state to the client.
        globalState.databaseConnection = client;
    } else {
        // Check if a file path was provided.
        let filePath = process.env.DATABASE_FILE;
        if (!filePath) {
            // Use /etc/cyno/db.sqlite3 as the default.
            filePath = "/etc/cyno/db.sqlite3";

            // Make the folder if it doesn't exist.
            const folder = path.dirname(filePath);
            mkdirSync(folder, { recursive: true });
        }

        // Create a better-sqlite3 client.
        globalState.databaseConnection = new BetterSQLite3(filePath);
    }
}

// Return the database connection.
export const client = "memory" in globalState.databaseConnection ?
    betterSqliteDrizzle(globalState.databaseConnection!, { schema }) :
    libsqlDrizzle(globalState.databaseConnection!, { schema });

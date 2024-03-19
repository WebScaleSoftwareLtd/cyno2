import { takeableTables } from "./takeable";
import * as schema from "../schema";
import BetterSQLite3 from "better-sqlite3";
import os from "os";
import path from "path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { client as mainClient } from "../client";
import { sql } from "drizzle-orm";
import { readFile, unlink } from "fs/promises";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export default async function takeout(gid: bigint) {
    // Create a temp file.
    const tempFile = path.join(os.tmpdir(), `${gid}_${new Date()}_${Math.random()}_cyno.db`);

    // Create the database.
    const db = new BetterSQLite3(tempFile);

    // Do the database migrations.
    const client = drizzle(db, { schema });
    migrate(client, { migrationsFolder: "../database/drizzle" });

    // Copy the data from the takeable tables.
    for (const table of takeableTables) {
        // Get from the main database.
        const rows = await mainClient.select().from(table).where(sql`guild_id = CAST(${gid} AS BLOB)`).execute();

        // Insert into the temp database.
        if (rows.length > 0) client.insert(table).values(rows).execute();
    }

    // Close the database.
    db.close();

    // Read the file.
    const buffer = await readFile(tempFile);

    // Delete the file.
    await unlink(tempFile);

    // Return the buffer.
    return buffer;
}

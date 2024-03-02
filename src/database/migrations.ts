import { migrate as libsqlMigrator } from "drizzle-orm/libsql/migrator";
import { migrate as BetterSQLite3Migrator } from "drizzle-orm/better-sqlite3/migrator";
import { client } from "./client";

export async function doMigrations() {
    "batch" in client ? 
        await libsqlMigrator(client, { migrationsFolder: "./drizzle" }) :
        BetterSQLite3Migrator(client, { migrationsFolder: "./drizzle" });
    console.log("Migrations done!");
}

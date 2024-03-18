import { migrate } from "drizzle-orm/libsql/migrator";
import { client } from "./client";

export async function doMigrations() {
    await migrate(client, { migrationsFolder: "./drizzle" });
    console.log("Migrations done!");
}

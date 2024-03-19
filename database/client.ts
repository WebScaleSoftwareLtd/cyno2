import { Client } from "@libsql/client";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export let client: LibSQLDatabase<typeof schema>;

export function setup(dbClient: Client) {
    client = drizzle(dbClient, { schema });
}

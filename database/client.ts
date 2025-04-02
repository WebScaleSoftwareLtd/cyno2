import { Pool } from "@neondatabase/serverless";
import { NeonDatabase, drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export let client: NeonDatabase<typeof schema>;

export function setup(dbClient: Pool) {
    client = drizzle(dbClient, { schema });
}

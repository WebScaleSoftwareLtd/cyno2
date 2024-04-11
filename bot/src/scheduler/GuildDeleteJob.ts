import { client, guilds } from "database";
import ScheduledJob from "./ScheduledJob";
import { and, eq, sql } from "drizzle-orm";

export default class GuildDeleteJob implements ScheduledJob<string> {
    constructor(private guildId: string) {}

    toJson() {
        return this.guildId;
    }

    async run() {
        await client
            .delete(guilds)
            .where(
                and(
                    eq(guilds.guildId, BigInt(this.guildId)),

                    // These should all be true, but this is a safety check since
                    // this is a destructive operation.
                    sql`${guilds.destroyAt} IS NOT NULL`,
                    sql`${guilds.destroyAt} < NOW()`,
                    sql`${guilds.destroyJobId} IS NOT NULL`,
                ),
            )
            .execute();
    }
}

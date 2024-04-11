import type { Guild } from "discord.js";
import { createTimeout, wipeGuildIntervalsAndTimeouts } from "../scheduler";
import GuildDeleteJob from "../scheduler/GuildDeleteJob";
import { client, guilds } from "database";
import { eq } from "drizzle-orm";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export default async function (guild: Guild) {
    // Check if this is an outage.
    if (!guild.available) return;

    // Drop the scheduler events.
    await wipeGuildIntervalsAndTimeouts(BigInt(guild.id));

    // Make a sticky event to delete the guild after 30 days.
    const monthFromNow = new Date(Date.now() + THIRTY_DAYS_IN_MS);
    const jobId = await createTimeout(
        null,
        new GuildDeleteJob(guild.id),
        monthFromNow,
    );

    // Update the guilds table.
    await client
        .update(guilds)
        .set({
            destroyAt: monthFromNow,
            destroyJobId: jobId,
        })
        .where(eq(guilds.guildId, BigInt(guild.id)))
        .execute();
}

import type { Guild } from "discord.js";
import { client, guilds } from "database";
import {
    createInterval,
    getGuildIntervalsAndTimeouts,
    intervalJobTypeExists,
} from "../scheduler";
import BirthdayPollJob from "../scheduler/BirthdayPollJob";

export default async function (guild: Guild) {
    // Ensure the guild is in the database.
    const guildId = BigInt(guild.id);
    await client
        .insert(guilds)
        .values({ guildId })
        .onConflictDoNothing()
        .execute();

    // Load in the timeouts and intervals for the guild.
    await getGuildIntervalsAndTimeouts(guildId);
    if (!(await intervalJobTypeExists(guildId, "BirthdayPollJob"))) {
        // Start the birthday poll job to go every 2 minutes.
        await createInterval(
            guildId,
            new BirthdayPollJob(guildId.toString()),
            2 * 60 * 1000,
        );
    }

    // Get the members from the guild.
    await guild.members.fetch();
}

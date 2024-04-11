import type { Guild } from "discord.js";
import { client, guilds } from "database";
import {
    createInterval,
    deleteTimeout,
    getGuildIntervalsAndTimeouts,
    intervalJobTypeExists,
} from "../scheduler";
import BirthdayPollJob from "../scheduler/BirthdayPollJob";

export default async function (guild: Guild) {
    // Ensure the guild is in the database.
    const guildId = BigInt(guild.id);
    const v = await client
        .insert(guilds)
        .values({ guildId })
        .onConflictDoUpdate({
            target: [guilds.guildId],
            set: { destroyAt: null, destroyJobId: null },
        })
        .returning({
            destroyJobId: guilds.destroyJobId,
        })
        .execute();

    // Cancel any destroy job.
    if (v.length !== 0 && v[0].destroyJobId) {
        const jobId = v[0].destroyJobId;
        await deleteTimeout(null, jobId);
    }

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

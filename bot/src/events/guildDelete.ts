import type { Guild } from "discord.js";
import { wipeGuildIntervalsAndTimeouts } from "../scheduler";

export default async function (guild: Guild) {
    // Check if this is an outage.
    if (!guild.available) return;

    // Drop the scheduler events.
    await wipeGuildIntervalsAndTimeouts(BigInt(guild.id));
}

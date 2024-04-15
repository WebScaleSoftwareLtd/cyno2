import type { CommandInteraction } from "discord.js";
import { client } from "database";
import { getGuild } from "../queries/guild";
import { levelToXp } from "../utils/tasoAlgo";

export const description = "Get you (or the user you specify)'s current XP.";

const UNICODE_RED_BLOCK = "🟥";
const UNICODE_GREEN_BLOCK = "🟩";

export async function run(interaction: CommandInteraction) {
    // Get the user.
    const user = interaction.options.getUser("user") ?? interaction.user;

    // Get the user's XP.
    const gid = BigInt(interaction.guildId!);
    const xp = (await client.query.experiencePoints.findFirst({
        where: (points, { and, eq }) =>
            and(eq(points.userId, BigInt(user.id)), eq(points.guildId, gid)),
    })) || { xp: 0, level: 1 };

    // Get the guild.
    const guild = await getGuild(gid);

    // Get the XP required to level up.
    const xpToLevelUp = levelToXp(guild.levelMultiplier, xp.level);

    // Get the % to the next level.
    const percentToNextLevel = xp.xp / xpToLevelUp;
    const blocks = [
        UNICODE_GREEN_BLOCK.repeat(Math.floor(percentToNextLevel * 10)),
        UNICODE_RED_BLOCK.repeat(10 - Math.floor(percentToNextLevel * 10)),
    ].join("");

    // Reply with the XP.
    return interaction.reply({
        embeds: [
            {
                color: 0x00ff00,
                description: `<@${user.id}>: **${xp.xp}XP | Level ${xp.level}**\n\n${blocks}`,
            },
        ],
        ephemeral: true,
    });
}

import { client, guilds } from "../database";

export const getGuild = async (guildId: bigint) => {
    // Select the guild. This is MOST cases.
    const guild = await client.query.guilds.findFirst({
        where: (guilds, { eq }) => eq(guilds.guildId, guildId),
    });
    if (guild) return guild;

    // Insert the guild.
    const rows = await client.insert(guilds).
        values({ guildId }).
        onConflictDoNothing().
        returning().
        execute();

    if (!rows[0]) {
        // Special case where we were raced by another insert.
        return (await client.query.guilds.findFirst({
            where: (guilds, { eq }) => eq(guilds.guildId, guildId),
        }))!;
    }

    return rows[0];
};

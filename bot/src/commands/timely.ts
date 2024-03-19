import type { CommandInteraction } from "discord.js";
import { client, timelyCollections } from "database";
import error from "../views/layouts/error";
import add from "../queries/financial/add";
import { getGuild } from "../queries/guild";
import success from "../views/layouts/success";

export const description = "Used to claim your free currency in a guild if enabled.";

export async function run(interaction: CommandInteraction) {
    // Get the timely config.
    const gid = BigInt(interaction.guildId!);
    const guildTimelyConfig = await client.query.guildTimelyConfig.findFirst({
        where: (configs, { eq }) => eq(configs.guildId, gid),
    }).execute();
    if (!guildTimelyConfig?.enabled) {
        return error(
            interaction, "Timely Collections Disabled",
            "Timely collections are disabled in this guild.",
        );
    }

    // Find the user's last collection.
    const uid = BigInt(interaction.user.id);
    const lastCollection = await client.query.timelyCollections.findFirst({
        where: (collections, { eq, and }) => and(
            eq(collections.guildId, gid),
            eq(collections.userId, uid),
        ),
    }).execute();
    if (lastCollection && lastCollection.lastCollected >= new Date()) {
        const nextCollection = lastCollection.lastCollected.getTime() + (guildTimelyConfig.hoursBetweenCollections * 60 * 60 * 1000);
        return error(
            interaction, "Not So Fast!",
            `You can claim your next collection <t:${nextCollection / 1000}:R>.`,
        );
    }

    // Add to the users balance.
    await add(
        gid, uid, BigInt(guildTimelyConfig.amount),
        "Timely collection",
    );

    // Update the collection time.
    const now = new Date();
    await client.insert(timelyCollections).values({
        guildId: gid, userId: uid, lastCollected: now,
    }).onConflictDoUpdate({
        target: [timelyCollections.guildId, timelyCollections.userId],
        set: { lastCollected: now },
    }).execute();

    // Get the guild configuration.
    const guild = await getGuild(gid);
    return success(
        interaction, "Timely Collection Complete",
        `You have collected ${guild.currencyEmoji} ${guildTimelyConfig.amount}.`,
    );
}

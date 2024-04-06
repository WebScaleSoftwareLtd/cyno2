import { client } from "database";
import type { CommandInteraction } from "discord.js";

export const description = "List the dashboard administrators.";

export async function run(interaction: CommandInteraction) {
    // Get the dashboard admins.
    const res = await client.query.dashboardAdmins
        .findMany({
            columns: { userId: true },
            where: (admins, { eq }) =>
                eq(admins.guildId, BigInt(interaction.guildId!)),
        })
        .execute();

    // Formulate the embed description.
    let description = "";
    for (const record of res) {
        description += `- <@${record.userId}>\n`;
    }
    if (description === "") description = "**No dashboard administrators.**";

    // Return the embed.
    return interaction.reply({
        ephemeral: true,
        embeds: [
            {
                title: "Dashboard Administrators",
                description,
            },
        ],
    });
}

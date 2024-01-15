import type { CommandInteraction } from "discord.js";

export const description = "Allows you to ping the bot.";

export async function run(interaction: CommandInteraction) {
    // Wait for a response from Discord.
    const t1 = Date.now();
    await interaction.deferReply();
    const t2 = Date.now();

    // Log how long the ping took.
    await interaction.editReply(`Ping took ${t2 - t1} ms`);
}

import type { APIEmbed, CommandInteraction } from "discord.js";

export const description = "Returns information about the bot.";

const embedDescription = `**Welcome to Cyno!**

Our aim with Cyno is to make a very easy to use bot which people want to interact with. I hope you are enjoying it.

Want to invite Cyno to your own guild? You can use the invite link [here](https://cyno.lol/invite).`;

export async function run(interaction: CommandInteraction) {
    const embed: APIEmbed = {
        color: 0x00ff00,
        description: embedDescription,
        fields: [
            {
                name: "Developers",
                value: `justsomedev
kelwing`,
            },
        ],
    };
    return interaction.reply({ embeds: [embed], ephemeral: true });
}

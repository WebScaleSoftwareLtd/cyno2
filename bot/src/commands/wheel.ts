import {
    type CommandInteraction,
    type APIApplicationCommandBasicOption,
    ApplicationCommandOptionType,
} from "discord.js";
import take from "../queries/financial/take";
import { insufficientFunds } from "../views/errors";
import { getGuild } from "../queries/guild";
import add from "../queries/financial/add";

const wheelRatios = [
    {
        Ratio: 1.5,
        Emoji: "↖️",
    },
    {
        Ratio: 1.7,
        Emoji: "⬆️",
    },
    {
        Ratio: 2.4,
        Emoji: "↗️",
    },
    {
        Ratio: 0.2,
        Emoji: "⬅️",
    },
    {
        Ratio: 1.2,
        Emoji: "➡️",
    },
    {
        Ratio: 0.1,
        Emoji: "↙️",
    },
    {
        Ratio: 0.3,
        Emoji: "⬇️",
    },
    {
        Ratio: 0.5,
        Emoji: "↘️",
    },
] as const;

export const description = "Allows you to gamble your currency on a wheel.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "amount",
        description: "The amount you wish to gamble.",
        required: true,
        type: ApplicationCommandOptionType.Number,
        min_value: 1,
    },
];

const wheelFormat = `**『${wheelRatios[0].Ratio}』 『${wheelRatios[1].Ratio}』 『${wheelRatios[2].Ratio}』\n\n『${wheelRatios[3].Ratio}』 ** EMOJI ** 『${wheelRatios[4].Ratio}』\n\n『${wheelRatios[5].Ratio}』 『${wheelRatios[6].Ratio}』 『${wheelRatios[7].Ratio}』**`;

export async function run(interaction: CommandInteraction) {
    // Get the amount.
    const amount = interaction.options.get("amount")!.value as number;

    // Take the money.
    const gid = BigInt(interaction.guildId!);
    const uid = BigInt(interaction.user.id);
    const sufficient = await take(gid, uid, BigInt(amount), "Spun wheel");
    const guild = await getGuild(gid);
    if (!sufficient)
        return insufficientFunds(interaction, amount, guild.currencyEmoji);

    // Spin the wheel (get a value between 0 and length of wheelRatios).
    const wheelIndex = Math.floor(Math.random() * wheelRatios.length);
    const wheel = wheelRatios[wheelIndex];

    // Figure out the earnings.
    const earnings = Math.floor(amount * wheel.Ratio);

    // If it isn't 0, give the user the money.
    if (earnings !== 0)
        await add(gid, uid, BigInt(earnings), "Wheel spin earnings");

    // Reply with the wheel.
    await interaction.reply({
        embeds: [
            {
                color: 0x00ff00,
                title: `${interaction.user.username} won: ${guild.currencyEmoji} ${earnings}`,
                description: wheelFormat.replace("EMOJI", wheel.Emoji),
            },
        ],
    });
}

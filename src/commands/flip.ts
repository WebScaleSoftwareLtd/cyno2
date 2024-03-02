import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type CommandInteraction,
} from "discord.js";
import take from "../queries/financial/take";
import { getGuild } from "../queries/guild";
import { insufficientFunds } from "../views/errors";
import add from "../queries/financial/add";

export const description = "Allows you to gamble your currency by flipping a virtual coin.";

export const options: APIApplicationCommandOption[] = [
    {
        name: "amount",
        description: "The amount you wish to gamble.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
    },
    {
        name: "side",
        description: "The side you wish to bet on.",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            { name: "Heads", value: "h" },
            { name: "Tails", value: "t" },
        ],
    },
];

export async function run(interaction: CommandInteraction) {
    // Take the money.
    const gid = BigInt(interaction.guildId!);
    const amount = interaction.options.get("amount")!.value as number;
    const sufficientFunds = await take(
        gid,
        BigInt(interaction.user.id),
        BigInt(amount),
        "Flipped a coin",
    );

    // Get the guild.
    const guild = await getGuild(gid);

    // If there are insufficient funds, return.
    if (!sufficientFunds) return insufficientFunds(interaction, amount, guild.currencyEmoji);

    // Get the side of the coin.
    const heads = (interaction.options.get("side")!.value as string) === "h";

    // Flip the coin.
    const coin = Math.random() < 0.5;

    // Determine if the user won.
    const won = heads === coin;
    const user = interaction.user;
    if (!won) {
        // Return here.
        return interaction.reply({
            embeds: [
                {
                    description: `**${user.username}${
                        user.discriminator === "0" ? "" : `#${user.discriminator}`
                    }** Better luck next time ^_^`,
                    color: 0xff0000,
                }
            ],
        });
    }

    // Give the user their currency.
    await add(
        gid,
        BigInt(interaction.user.id),
        BigInt(amount * 2),
        "Coin landed on betted side",
    );

    // Send a success message.
    return interaction.reply({
        embeds: [
            {
                description: `**${user.username}${
                    user.discriminator === "0" ? "" : `#${user.discriminator}`
                }** You guessed it! You won ${guild.currencyEmoji} **${amount * 2}**!`,
                color: 0x00ff00,
            }
        ],
    });
}

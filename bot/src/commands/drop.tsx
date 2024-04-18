import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
    type Message,
} from "discord.js";
import take from "../queries/financial/take";
import { getGuild } from "../queries/guild";
import { insufficientFunds } from "../views/errors";
import { renderManager } from "../state";
import CurrencyDrop from "../shared/CurrencyDrop";
import { client, currencyDrop } from "database";

export const description = "Allows you to drop currency.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "amount",
        description: "The amount you wish to give.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 10,
    },
];

export async function run(interaction: CommandInteraction) {
    // Take the money.
    const amount = interaction.options.get("amount")!.value as number;
    const gid = BigInt(interaction.guildId!);
    const sufficientFunds = await take(
        gid,
        BigInt(interaction.user.id),
        amount,
        "Dropped currency",
    );

    // Get the guild.
    const guild = await getGuild(gid);

    // If there are insufficient funds, return.
    if (!sufficientFunds)
        return insufficientFunds(interaction, amount, guild.currencyEmoji);

    // Reply with the drop.
    const messagePtr: [Message | undefined] = [undefined];
    const message = await renderManager.reply(
        interaction,
        <CurrencyDrop
            amount={amount}
            emoji={guild.currencyEmoji}
            blanks={guild.dropBlanks}
            description={guild.dropMessage}
            embedImageUrl={guild.dropImage}
            messagePtr={messagePtr}
        />,
    );
    messagePtr[0] = message;
    await client
        .insert(currencyDrop)
        .values({
            messageId: BigInt(message.id),
            guildId: gid,
            amount,
        })
        .onConflictDoNothing()
        .execute();
}

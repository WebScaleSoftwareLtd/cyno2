import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type CommandInteraction,
} from "discord.js";
import * as errors from "../views/errors";
import { getGuild } from "../queries/guild";
import success from "../views/layouts/success";
import transfer from "../queries/financial/transfer";

export const description = "Allows you to give your balance to someone else.";

export const options: APIApplicationCommandOption[] = [
    {
        name: "recipient",
        description: "The person who would be getting the currency.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "amount",
        description: "The amount you wish to give.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
    },
];

export async function run(interaction: CommandInteraction) {
    const user = interaction.options.getUser("recipient", true);
    const member = interaction.options.getMember("recipient");
    if (!member) return errors.notAMember(interaction);

    // Handle if the user is itself.
    if (interaction.user.id === user.id)
        return errors.financialActionToSelf(interaction);

    const amount = interaction.options.get("amount")!.value as number;

    const gid = BigInt(interaction.guildId!);
    const guild = await getGuild(gid);
    const sufficientFunds = await transfer(
        gid,
        BigInt(interaction.user.id),
        BigInt(user.id),
        BigInt(amount),
        `Paid <@${user.id}>`,
        `Paid by <@${interaction.user.id}>`,
    );
    if (!sufficientFunds)
        return errors.insufficientFunds(
            interaction,
            amount,
            guild.currencyEmoji,
        );

    return success(
        interaction,
        "Payment Successful",
        `You successfully paid <@${user.id}> ${guild.currencyEmoji} ${amount}.`,
    );
}

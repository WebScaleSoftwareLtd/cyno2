import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type CommandInteraction,
    type PermissionResolvable,
} from "discord.js";
import { notAMember } from "../views/errors";
import set from "../queries/financial/set";
import success from "../views/layouts/success";
import { getGuild } from "../queries/guild";

export const description = "Allows you to set the balance of another member.";

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
];

export const options: APIApplicationCommandOption[] = [
    {
        name: "member",
        description: "The member who would have their currency set.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "amount",
        description: "The amount to set the balance to.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 0,
    },
];

export async function run(interaction: CommandInteraction) {
    // Make sure this is a member.
    const member = interaction.options.getMember("member");
    if (!member) return notAMember(interaction);
    const user = interaction.options.getUser("member", true);

    // Set the balance.
    const amount = interaction.options.get("amount")!.value as number;
    await set(
        BigInt(interaction.guildId!),
        BigInt(user.id),
        BigInt(amount),
        `Balance set by <@${interaction.user.id}>`,
    );

    // Send a success message.
    const guild = await getGuild(BigInt(interaction.guildId!));
    success(
        interaction,
        "Balance Set",
        `You successfully set the balance of <@${user.id}> to ${guild.currencyEmoji} ${amount}.`,
    );
}

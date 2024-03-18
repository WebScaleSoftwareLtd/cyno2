import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type CommandInteraction,
    type PermissionResolvable,
} from "discord.js";
import * as errors from "../views/errors";
import add from "../queries/financial/add";
import { getGuild } from "../queries/guild";
import success from "../views/layouts/success";

export const description = "Allows a admin to add balance to someone else.";

export const defaultPermissions: PermissionResolvable = ["Administrator", "ManageGuild"];

export const options: APIApplicationCommandOption[] = [
    {
        name: "user",
        description: "The user to add balance to.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "amount",
        description: "The amount to add.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
    },
    {
        name: "reason",
        description: "The reason for adding balance.",
        type: ApplicationCommandOptionType.String,
        required: true,
    },
];

export async function run(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const member = interaction.options.getMember("user");
    if (!member) return errors.notAMember(interaction);

    const amount = interaction.options.get("amount")!.value as number;
    const reason = interaction.options.get("reason")!.value as string;

    const guild = await getGuild(BigInt(interaction.guildId!));
    await add(BigInt(interaction.guildId!), BigInt(user.id), BigInt(amount), reason);

    return success(
        interaction, "Balance Add Successful",
        `You successfully added to <@${user.id}>'s balance ${guild.currencyEmoji} ${amount}!`,
    );
}

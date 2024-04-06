import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
} from "discord.js";
import addMany from "../queries/financial/addMany";
import success from "../views/layouts/success";
import { getGuild } from "../queries/guild";

export const description =
    "Give all users which have a role an amount of currency.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "role",
        description: "The role to give currency to.",
        type: ApplicationCommandOptionType.Role,
        required: true,
    },
    {
        name: "amount",
        description:
            "The amount of currency you want to give to all users with the role.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
    },
];

export async function run(interaction: CommandInteraction) {
    // Get the role ID and amount.
    const roleId = interaction.options.get("role")!.value as string;
    const amount = interaction.options.get("amount")!.value as number;

    // Find members with the role.
    const role = interaction.guild!.roles.cache.get(roleId);
    const memberIds = interaction
        .guild!.members.cache.filter((member) => member.roles.cache.has(roleId))
        .map((x) => BigInt(x.id));

    const gid = BigInt(interaction.guildId!);
    const guild = await getGuild(gid);
    await addMany(
        gid,
        memberIds,
        BigInt(amount),
        `Gave by <@${interaction.user.id}> to all users with the role ${role ? role.name : "they specified"}`,
    );

    // Send a message.
    return success(
        interaction,
        "Successfully Gave Currency",
        `You successfully gave ${guild.currencyEmoji} ${amount} to all users with the role ${role ? role.name : "you specified"}.`,
    );
}

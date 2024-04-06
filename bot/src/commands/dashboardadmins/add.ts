import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
} from "discord.js";
import { notAMember } from "../../views/errors";
import { client, dashboardAdmins } from "database";
import error from "../../views/layouts/error";
import success from "../../views/layouts/success";

export const description = "Adds a dashboard administrator.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "member",
        description: "The member to add as a dashboard administrator.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
];

export async function run(interaction: CommandInteraction) {
    // Check the user is a member.
    const member = interaction.options.getMember("member");
    if (!member) return notAMember(interaction);

    // Add the user as a dashboard admin.
    const res = await client
        .insert(dashboardAdmins)
        .values({
            userId: BigInt(interaction.options.getUser("member", true).id),
            guildId: BigInt(interaction.guildId!),
        })
        .onConflictDoNothing({
            target: [dashboardAdmins.guildId, dashboardAdmins.userId],
        })
        .execute();

    // If the user is already a dashboard admin, return an error.
    if (res.rowsAffected === 0)
        return error(
            interaction,
            "Already a Dashboard Admin",
            "The user is already a dashboard administrator.",
        );

    // Return success.
    return success(
        interaction,
        "Dashboard Admin Added",
        "The user has been successfully added as a dashboard administrator.",
    );
}

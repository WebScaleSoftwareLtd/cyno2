import { client, dashboardAdmins } from "database";
import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import error from "../../views/layouts/error";
import success from "../../views/layouts/success";

export const description = "Removes a dashboard administrator.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "user",
        description: "The user to remove as a dashboard administrator.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
];

export async function run(interaction: CommandInteraction) {
    // Get the user.
    const user = interaction.options.getUser("user", true);

    // Remove the user as a dashboard admin.
    const res = await client
        .delete(dashboardAdmins)
        .where(
            and(
                eq(dashboardAdmins.userId, BigInt(user.id)),
                eq(dashboardAdmins.guildId, BigInt(interaction.guildId!)),
            ),
        )
        .execute();

    // Handle if the user was never an admin.
    if (res.rowsAffected === 0)
        return error(
            interaction,
            "Not a Dashboard Admin",
            "The user was not a dashboard administrator.",
        );

    // Return success.
    return success(
        interaction,
        "Dashboard Admin Removed",
        "The user has been successfully removed as a dashboard administrator.",
    );
}

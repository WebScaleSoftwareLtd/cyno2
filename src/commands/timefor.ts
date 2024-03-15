import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type CommandInteraction,
} from "discord.js";
import { notAMember } from "../views/errors";
import { client } from "../database";
import error from "../views/layouts/error";

export const description = "Gets the time for a user.";

export const options: APIApplicationCommandOption[] = [
    {
        name: "user",
        description: "The user to check the balance of.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
];

export async function run(interaction: CommandInteraction) {
    // Get the member.
    const user = interaction.options.getUser("user")!;
    const member = interaction.options.getMember("user");
    if (!member) return notAMember(interaction);

    // Try to get the users timezone.
    const record = await client.query.timeLocation.findFirst({
        where: (locations, { eq }) => eq(locations.userId, BigInt(user.id)),
    }).execute();
    if (!record) {
        return error(
            interaction, "Timezone Not Found",
            `The user <@${user.id}> has not set their timezone.`,
        );
    }
    const timeZone = record.location;

    // Get the current time and return it formatted.
    const formatted = new Date().toLocaleString("en-US", {
        timeZone, hour: "numeric", minute: "numeric", second: "numeric",
    });
    return interaction.reply({
        embeds: [
            {
                color: 0x00FF00,
                description: `The current time for <@${user.id}> is ${formatted}`,
            },
        ],
    });
}

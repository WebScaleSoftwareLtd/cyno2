import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
    type PermissionResolvable,
} from "discord.js";
import durationParse from "../utils/durationParse";
import error from "../views/layouts/error";
import { createTimeout } from "../scheduler";
import ChannelReminderJob from "../scheduler/ChannelReminderJob";
import success from "../views/layouts/success";

export const description =
    "Reminds this current channel of something at a specific time.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "message",
        description: "The message to remind with.",
        type: ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: "duration",
        description: "The duration to remind at.",
        type: ApplicationCommandOptionType.String,
        required: true,
    },
];

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
    "ManageMessages",
];

export async function run(interaction: CommandInteraction) {
    // Get the message and time.
    const message = interaction.options.get("message")!.value as string;
    const duration = durationParse(
        interaction.options.get("duration")!.value as string,
    );

    // If duration is less than 1 minute in ms, return.
    if (duration < 60000)
        return error(
            interaction,
            "Invalid Duration",
            "The duration must be at least 1 minute.",
        );

    // Create the timeout.
    await createTimeout(
        BigInt(interaction.guildId!),
        new ChannelReminderJob({
            userId: interaction.user.id,
            channelId: interaction.channelId!,
            message,
        }),
        new Date(Date.now() + duration),
    );

    // Reply with the success message.
    await success(
        interaction,
        "Channel Reminder Set",
        "You have successfully set a reminder for this channel.",
    );
}

import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type CommandInteraction,
} from "discord.js";
import error from "../views/layouts/error";

export const description = "Allows you to set your birthday. You can only do this once.";

export const options: APIApplicationCommandOption[] = [
    {
        name: "birthday",
        description: "The date of your birthday.",
        type: ApplicationCommandOptionType.String,
        required: true,
    },
];

const monthMapping = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10,
    november: 11, december: 12,
} as const;

const DASH_OR_SLASH = /[-/]/g;

export async function run(interaction: CommandInteraction) {
    const birthday = interaction.options.get("birthday")!.value as string;

    const s = birthday.split(DASH_OR_SLASH);
    if (s.length !== 3) {
        return error(
            interaction, "Invalid Date",
            "The date must be in the format of `YYYY-MM-DD` or `MM/DD/YYYY`.",
        );
    }

    if (s[0].length === 4) {
        // Years are always at the end.
        const y = s.shift()!;
        s.push(y);
    }

    // Parse the time.
    const year = parseInt(s.pop() || "0", 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
        return error(
            interaction, "Invalid Year", "The year must be be valid.",
        );
    }

    // TODO
}

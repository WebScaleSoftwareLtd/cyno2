import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteFocusedOption,
    type CommandInteraction,
} from "discord.js";
import { readdir, stat } from "fs/promises";
import { client, timeLocation } from "database";
import success from "../views/layouts/success";

export const description =
    "Sets the location for your user. Used for timezone lookups.";

export const options: APIApplicationCommandOption[] = [
    {
        name: "location",
        description: "The location to set the timezone to.",
        autocomplete: true,
        required: true,
        type: ApplicationCommandOptionType.String,
    },
];

async function loadTzLocations() {
    const timezones: string[] = [];
    let loadFolder: (frag: string) => Promise<void>;
    loadFolder = async (frag) => {
        const files = await readdir(`/usr/share/zoneinfo/${frag}`);
        for (const file of files) {
            // Make sure the file starts upper case if this is a root.
            if (frag === "") {
                // Get the first character.
                const firstChar = file[0];
                if (!firstChar) continue;

                // Make sure it is upper case.
                if (firstChar.toLocaleLowerCase() === firstChar) continue;
            }

            // Get the timezone chunk.
            const path = `${frag}/${file}`;

            // Load the path.
            const s = await stat(`/usr/share/zoneinfo/${path}`);
            if (s.isSymbolicLink()) continue;
            if (s.isDirectory()) {
                await loadFolder(path);
            } else {
                timezones.push(path.substring(1));
            }
        }
    };

    await loadFolder("");
    return timezones;
}
const tzLocations = loadTzLocations();

export const autocompleteHandler = async (
    interaction: AutocompleteFocusedOption,
): Promise<ApplicationCommandOptionChoiceData[]> => {
    // Handle if the interaction is not for the location.
    if (interaction.name !== "location") return [];

    // Get the quotes.
    const q = interaction.value as string;
    if (q === "") return [];
    const locations = await tzLocations;

    // Filter the locations.
    const filteredLocations = locations.filter((location) =>
        location.toLowerCase().includes(q),
    );

    // Make sure we only have a maximum of 25 locations.
    const slicedLocations = filteredLocations.slice(0, 25);

    // Return the choices.
    return slicedLocations.map((location) => ({
        name: location,
        value: location,
    }));
};

export async function run(interaction: CommandInteraction) {
    // Get the location.
    const location = interaction.options.get("location")!.value as string;

    // Write the location to the database.
    await client
        .insert(timeLocation)
        .values({
            userId: BigInt(interaction.user.id),
            location,
        })
        .onConflictDoUpdate({
            target: [timeLocation.userId],
            set: { location },
        });

    // Respond with a success.
    success(
        interaction,
        "Timezone Set",
        `Your timezone has been set to **${location}**.`,
    );
}

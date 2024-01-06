import type {
    APIApplicationCommandOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";

export type Command = {
    description: string;
    options?: APIApplicationCommandOption[];
    defaultPermissions?: PermissionResolvable;
    autocompleteHandler?: (interaction: AutocompleteFocusedOption) =>
        Promise<ApplicationCommandOptionChoiceData[]>;
    run: (interaction: CommandInteraction) => Promise<any>;
};

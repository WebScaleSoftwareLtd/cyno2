import type {
    APIApplicationCommandBasicOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";

export type RootCommand = {
    options?: APIApplicationCommandBasicOption[];
    description: string;
    autocompleteHandler?: (
        interaction: AutocompleteFocusedOption,
    ) => Promise<ApplicationCommandOptionChoiceData[]>;
    run: (interaction: CommandInteraction) => Promise<any>;
};

export type ParentCommand = {
    description: string;
    subcommands: { [name: string]: RootCommand };
};

export type Command = {
    defaultPermissions?: PermissionResolvable;
} & (ParentCommand | RootCommand);

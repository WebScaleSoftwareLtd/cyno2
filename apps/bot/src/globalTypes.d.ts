import type { APIApplicationCommandOption, CommandInteraction, PermissionResolvable } from "discord.js";

export type Command = {
    description: string;
    options?: APIApplicationCommandOption[];
    defaultPermissions?: PermissionResolvable;
    run: (interaction: CommandInteraction) => Promise<any>;
};

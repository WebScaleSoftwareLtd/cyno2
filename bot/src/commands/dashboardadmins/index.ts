import type { PermissionResolvable } from "discord.js";
import type { RootCommand } from "../../globalTypes";

import * as add from "./add";
import * as list from "./list";
import * as remove from "./remove";

export const description =
    "Commands to manage the dashboard admins. These users can manage the bot in the Cyno dashboard.";

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
];

export const subcommands: { [name: string]: RootCommand } = {
    add,
    list,
    remove,
};

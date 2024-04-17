import type { CommandInteraction } from "discord.js";
import { client, timelyCollections } from "database";
import error from "../views/layouts/error";
import add from "../queries/financial/add";
import { getGuild } from "../queries/guild";
import success from "../views/layouts/success";

export const description =
    "Used to claim your free currency in a guild if enabled.";

export async function run(interaction: CommandInteraction) {
    return error(
        interaction,
        "Timely Collections Disabled",
        "Timely collections are disabled.",
    );
}

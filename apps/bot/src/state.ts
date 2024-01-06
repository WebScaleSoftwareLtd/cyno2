import type { Client } from "@libsql/client";
import type { Client as DjsClient } from "discord.js";
import { ReacordDiscordJs, ReacordInstance } from "reacord";
import * as Discord from "discord.js";

type State = {
    // Anything added here will be persisted across hot reloads.
    databaseConnection?: Client;
};

declare global {
    var __STATE__: State;
}

export const globalState = global.__STATE__ ? global.__STATE__ : (() => {
    const state = {};
    global.__STATE__ = state;
    return state;
})() as State;

export let reacord: ReacordDiscordJs;

export const setupReacord = (client: DjsClient) => reacord = new ReacordDiscordJs(client);

import type { Client } from "@libsql/client";
import type { Database } from "better-sqlite3";
import type { Client as DjsClient } from "discord.js";
import { RenderManager } from "react-djs";

type State = {
    // Anything added here will be persisted across hot reloads.
    databaseConnection?: Client | Database;

    // Defines the discord.js client.
    client?: DjsClient;
};

declare global {
    var __STATE__: State;
}

export const globalState = global.__STATE__ ? global.__STATE__ : (() => {
    const state = {};
    global.__STATE__ = state;
    return state;
})() as State;

export let renderManager: RenderManager;

export const setupReactDjs = () => renderManager = new RenderManager(globalState.client!);

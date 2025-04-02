import type { Pool } from "@neondatabase/serverless";
import type { Client } from "discord.js";
import { RenderManager } from "react-djs";

type State = {
    // Anything added here will be persisted across hot reloads.
    databaseConnection?: Pool;

    // Defines the discord.js client.
    client?: Client;
};

declare global {
    var __STATE__: State;
}

export const globalState = global.__STATE__
    ? global.__STATE__
    : ((() => {
          const state = {};
          global.__STATE__ = state;
          return state;
      })() as State);

export let renderManager: RenderManager;

export const setupReactDjs = () =>
    (renderManager = new RenderManager(globalState.client!));

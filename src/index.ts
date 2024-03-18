// Get the discord.js type.
import type { ApplicationCommand, AutocompleteInteraction, Client } from "discord.js";

// Get all of the discord.js events.
import message from "./events/message";
import ready from "./events/ready";
import guildCreate from "./events/guildCreate";
import guildDelete from "./events/guildDelete";

// Get everything required for command setup.
import { globalState, setupReactDjs } from "./state";
import type { Command } from "./globalTypes";
import * as commands from "./commands";

// Log that the module was loaded.
console.log("Module loaded!");

// Handle command migrations.
const commandRegistration = async (client: Client) => {
    const currentCommands = await client.application!.commands.fetch();
    const promises: Promise<ApplicationCommand>[] = [];
    for (const [name, command] of Object.entries(commands)) {
        const cmd: Command = command;
        promises.push(client.application!.commands.create({
            name,
            description: cmd.description,
            options: cmd.options,
            defaultMemberPermissions: cmd.defaultPermissions,
        }));
        currentCommands.delete(name);
    }
    await Promise.all([
        Promise.all(promises),
        Promise.all(
            currentCommands.map((_, name) => client.application!.commands.delete(name))
        ),
    ]);
};

export default (client: Client) => {
    if (process.env.CMD_MIGRATE === "1") {
        // Handle command migrations.
        client.on("ready", async () => {
            try {
                await commandRegistration(client);
                console.log("Commands migrated!");
                process.exit(0);
            } catch (err) {
                console.error(err);
                process.exit(1);
            }
        });
        return () => client.removeAllListeners();
    }

    // Add Discord events.
    client.on("messageCreate", message);
    client.on("ready", () => ready(client));
    client.on("guildCreate", guildCreate);
    client.on("guildDelete", guildDelete);

    // Hook the client to the global state.
    globalState.client = client;

    // Setup react-djs.
    setupReactDjs();

    // Handle auto-complete interactions.
    const autocompleteHandler = async (interaction: AutocompleteInteraction) => {
        // Get the command.
        const command = (commands as Record<string, Command | undefined>)[interaction.commandName];
        if (!command) return;

        // If there isn't a select menu handler, return.
        if (!command.autocompleteHandler) return;

        // Find the option in question.
        interaction.respond(
            await command.autocompleteHandler(interaction.options.getFocused(true))
        );
    };

    // Defines the interaction handler.
    client.on("interactionCreate", async interaction => {
        if (interaction.isAutocomplete()) return autocompleteHandler(interaction);
        if (!interaction.isCommand()) return;

        const command = (commands as Record<string, Command | undefined>)[interaction.commandName];
        if (!command) {
            interaction.reply("Unknown command!");
            return;
        }

        await command.run(interaction);
    });

    // Defines the destructor.
    return () => client.removeAllListeners();
};

export { doMigrations } from "./database";

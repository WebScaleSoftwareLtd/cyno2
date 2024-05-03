// Get the discord.js types.
import {
    ApplicationCommandOptionType,
    REST,
    PermissionsBitField,
    Client,
    type APIApplicationCommandSubcommandOption,
    type AutocompleteInteraction,
} from "discord.js";
import { API } from "@discordjs/core/http-only";
import { globalState, setupReactDjs } from "./state";

// Get all of the discord.js events.
import message from "./events/message";
import ready from "./events/ready";
import guildCreate from "./events/guildCreate";
import guildDelete from "./events/guildDelete";

// Get everything required for command setup.
import type { Command, ParentCommand, RootCommand } from "./globalTypes";
import * as commands from "./commands";
import { handleException, unhandledDestructor } from "./exceptionHandler";

// Log that the module was loaded.
console.log("Module loaded!");

// Handle subcommand mapping.
function mapSubcommands(subcommands: { [name: string]: RootCommand }) {
    return Object.entries(subcommands).map(
        ([name, { options, description }]) => {
            const opt: APIApplicationCommandSubcommandOption = {
                type: ApplicationCommandOptionType.Subcommand,
                name,
                options,
                description,
            };
            return opt;
        },
    );
}

// Handle command migrations.
async function commandRegistration() {
    const api = new API(
        new REST({ version: "10" }).setToken(process.env.TOKEN!),
    );
    const me = await api.users.getCurrent();
    const cmds = Object.entries(commands).map(([name, command]) => {
        const cmd: Command = command;
        return {
            contexts: [0], // Guild only.
            name,
            description: cmd.description,
            options:
                "subcommands" in cmd
                    ? mapSubcommands((cmd as ParentCommand).subcommands)
                    : cmd.options,
            default_member_permissions: cmd.defaultPermissions
                ? new PermissionsBitField(cmd.defaultPermissions).toJSON()
                : undefined,
        };
    });
    await api.applicationCommands.bulkOverwriteGlobalCommands(me.id, cmds);
}

// Defines the main entrypoint.
export default () => {
    if (process.env.CMD_MIGRATE === "1") {
        return (async () => {
            // Handle command migrations.
            try {
                await commandRegistration();
                console.log("Commands migrated!");
                process.exit(0);
            } catch (err) {
                console.error(err);
                process.exit(1);
            }
        })();
    }

    // Get the client from the global state.
    let client = globalState.client!;
    if (!client) {
        // Get the shard count.
        const shardCount = parseInt(process.env.SHARD_COUNT || "1");
        if (isNaN(shardCount)) throw new Error("Invalid shard count");

        // Get the shard ID.
        let shardId: number;
        if (process.env.SHARD_ID) {
            shardId = parseInt(process.env.SHARD_ID);
            if (isNaN(shardId)) throw new Error("Invalid shard ID");
        } else if (process.env.POD_NAME) {
            shardId = parseInt(process.env.POD_NAME.split("-").pop()!);
            if (isNaN(shardId)) throw new Error("Invalid shard ID");
        } else {
            shardId = 0;
        }

        // Build the client.
        client = new Client({
            intents: ["Guilds", "GuildMessages", "GuildMembers"],
            shardCount,
            shards: [shardId],
        });

        // Set the client in the global state.
        globalState.client = client;
    }

    // Add Discord events.
    client.on("messageCreate", message);
    client.on("ready", ready);
    client.on("guildCreate", guildCreate);
    client.on("guildDelete", guildDelete);

    // Setup react-djs.
    setupReactDjs();

    // Handle auto-complete interactions.
    const autocompleteHandler = async (
        interaction: AutocompleteInteraction,
    ) => {
        // Get the command.
        let command = (commands as Record<string, Command | undefined>)[
            interaction.commandName
        ];
        if (!command) return;

        // Check if the command has sub-commands and if this is one of those.
        if ("subcommands" in command) {
            const subcommand =
                command.subcommands[interaction.options.getSubcommand()];
            if (!subcommand) return;
            command = subcommand;
        }

        // If there isn't a select menu handler, return.
        if (!command.autocompleteHandler) return;

        // Find the option in question.
        interaction.respond(
            await command.autocompleteHandler(
                interaction.options.getFocused(true),
            ),
        );
    };

    // Defines the interaction handler.
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isAutocomplete())
            return autocompleteHandler(interaction);
        if (!interaction.isCommand()) return;

        let command = (commands as Record<string, Command | undefined>)[
            interaction.commandName
        ];
        if (!command) {
            interaction.reply("Unknown command!");
            return;
        }

        // Handle sub-commands.
        if ("subcommands" in command) {
            if (!interaction.isChatInputCommand()) return;
            const subcommand =
                command.subcommands[interaction.options.getSubcommand()];
            if (!subcommand) {
                interaction.reply("Unknown subcommand!");
                return;
            }
            command = subcommand;
        }

        try {
            await command.run(interaction);
        } catch (err) {
            // Tell the user something went wrong.
            await interaction.reply("Oops! Something went wrong.");
            handleException(err as Error);
        }
    });

    // Defines the destructor.
    return () => {
        client.removeAllListeners();
        unhandledDestructor && unhandledDestructor();
    };
};

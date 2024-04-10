import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
    type PermissionResolvable,
} from "discord.js";
import error from "../views/layouts/error";
import success from "../views/layouts/success";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import { drizzle } from "drizzle-orm/better-sqlite3";
import BetterSQLite3 from "better-sqlite3";
import { client } from "database";
import * as schema from "database/schema";
import { takeableTables } from "database/takeout";

export const description = "Allows you to import a dumped database.";

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
    "ManageMessages",
];

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "database",
        description: "The database to import.",
        type: ApplicationCommandOptionType.Attachment,
        required: true,
    },
];

const notAValidDatabase = (interaction: CommandInteraction) =>
    error(
        interaction,
        "Not a Valid Database",
        "The attachment provided is not a valid database.",
    );

async function handleImport(interaction: CommandInteraction, tempFile: string) {
    // Try opening the database.
    let sqliteDb;
    try {
        sqliteDb = new BetterSQLite3(tempFile);
    } catch {
        // This is probably not a valid SQLite database.
        return notAValidDatabase(interaction);
    }

    try {
        // Load the database schema.
        let database;
        try {
            database = drizzle(sqliteDb, { schema });
        } catch {
            // If drizzle is unable to load this, it is not a valid database.
            return notAValidDatabase(interaction);
        }

        // Get the guild record from the database.
        let guildRecord;
        try {
            guildRecord = database.query.guilds
                .findFirst({
                    where: (guilds, { eq }) =>
                        eq(guilds.guildId, BigInt(interaction.guildId!)),
                })
                .sync();
            if (!guildRecord)
                return error(
                    interaction,
                    "Guild Not Found",
                    "The guild record was not found in the database.",
                );
        } catch {
            return error(
                interaction,
                "Failed to Import Guild",
                "Failed to query the guild record.",
            );
        }

        // Merge in the guild record.
        guildRecord.destroyAt = null;
        try {
            await client
                .insert(schema.guilds)
                .values(guildRecord)
                .onConflictDoUpdate({
                    target: [schema.guilds.guildId],
                    set: guildRecord,
                })
                .execute();
        } catch {
            return error(
                interaction,
                "Failed to Import Guild",
                "Failed to import the guild record.",
            );
        }

        // Go through the takeable tables.
        for (const [name, table] of Object.entries(schema)) {
            // Skip the guilds table.
            if (name === "guilds") continue;

            // Check if the table is takeable. If not, we do not want to import it.
            if (!takeableTables.includes(table)) continue;

            // Get the records from the database.
            const selected = await database.select().from(table);
            if (selected.length === 0) continue;
            try {
                // Insert the records into the main database.
                await client
                    .insert(table)
                    .values(selected)
                    .onConflictDoNothing()
                    .execute();
            } catch (err) {
                return error(
                    interaction,
                    "Failed to Import Table",
                    `Failed to import the ${name} table: \`${err}\``,
                );
            }
        }

        // Send a success message.
        return success(
            interaction,
            "Database Imported",
            "The database has been successfully imported.",
        );
    } finally {
        // Always close the database.
        sqliteDb.close();
    }
}

export async function run(interaction: CommandInteraction) {
    // Get the attachment.
    const attachment = interaction.options.get("database", true).attachment!;
    if (attachment.contentType) return notAValidDatabase(interaction);

    // Download the attachment.
    const buffer = await fetch(attachment.url).then((res) => {
        if (!res.ok)
            throw new Error(
                `Failed to download the attachment: got status ${res.status}`,
            );
        return res.arrayBuffer();
    });

    // Save to a temporary file.
    const tempFile = join(
        tmpdir(),
        `discord-bot-${interaction.id}-${Date.now()}.db`,
    );
    await writeFile(tempFile, Buffer.from(buffer));

    try {
        // Handle the import in another function so it is always cleaned up even if it errors.
        await handleImport(interaction, tempFile);
    } finally {
        // Cleanup the temporary file.
        await unlink(tempFile);
    }
}

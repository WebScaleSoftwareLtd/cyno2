import { CommandInteraction, PermissionResolvable } from "discord.js";
import takeout from "database/takeout";
import { client, lastGuildTakeout } from "database";

export const description =
    "Allows you to take a SQLite3 copy of your guild's database.";

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
];

export async function run(interaction: CommandInteraction) {
    // Get the guild ID.
    const gid = BigInt(interaction.guildId!);

    // Check when the last takeout was.
    const res = await client.query.lastGuildTakeout
        .findFirst({
            where: (takeouts, { eq }) => eq(takeouts.guildId, gid),
        })
        .execute();
    if (res) {
        // Handle if the last takeout was less than 24 hours ago.
        const now = new Date();
        const last = new Date(res.lastTakeout);

        const diff = now.getTime() - last.getTime();
        if (diff < 1000 * 60 * 60 * 24) {
            return interaction.reply({
                content:
                    "You can only take a database takeout once every 24 hours.",
                ephemeral: true,
            });
        }
    }

    // Send the thinking message.
    await interaction.deferReply({ ephemeral: true });

    // Run a takeout.
    const buf = await takeout(gid);

    // Send the file.
    await interaction.editReply({
        content: `**Your database takeout is ready!**

You can use the attached file by downloading [a copy of Cyno](https://github.com/WebScaleSoftwareLtd/Cyno2) and setting this as the database.
`,
        files: [
            {
                attachment: buf,
                name: `takeout-${gid}.db`,
            },
        ],
    });

    // Update the last takeout.
    await client
        .insert(lastGuildTakeout)
        .values({
            guildId: gid,
            lastTakeout: new Date(),
        })
        .onConflictDoUpdate({
            target: [lastGuildTakeout.guildId],
            set: {
                lastTakeout: new Date(),
            },
        })
        .execute();
}

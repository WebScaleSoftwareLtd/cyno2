import { client, transactions, wallet } from "database";
import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
    type PermissionResolvable,
} from "discord.js";
import { and, eq, sql } from "drizzle-orm";
import success from "../views/layouts/success";

export const description =
    "Move balance from one user to another, including all transactions.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "source",
        description: "The user to take balance from.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "target",
        description: "The user to give balance to.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
];

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
    "ManageMessages",
];

export async function run(interaction: CommandInteraction) {
    // Get the source and target users.
    const source = interaction.options.getUser("source", true);
    const target = interaction.options.getUser("target", true);

    // Move the balance within a transaction so it rolls back if there is an error.
    await client.transaction(async (client) => {
        // Remove the source users wallet and get the balance.
        const sourceWallet = await client
            .delete(wallet)
            .where(
                and(
                    eq(wallet.userId, BigInt(source.id)),
                    eq(wallet.guildId, BigInt(interaction.guildId!)),
                ),
            )
            .returning({ balance: wallet.balance })
            .execute();

        // Add the balance to the target user if the source user had a wallet.
        if (sourceWallet.length !== 0) {
            await client
                .insert(wallet)
                .values({
                    userId: BigInt(target.id),
                    guildId: BigInt(interaction.guildId!),
                    balance: sourceWallet[0].balance,
                })
                .onConflictDoUpdate({
                    target: [wallet.guildId, wallet.userId],
                    set: {
                        balance: sql`${wallet.balance} + ${sourceWallet[0].balance}`,
                    },
                })
                .execute();
        }

        // Move the transactions.
        await client
            .update(transactions)
            .set({
                userId: BigInt(target.id),
            })
            .where(
                and(
                    eq(transactions.userId, BigInt(source.id)),
                    eq(transactions.guildId, BigInt(interaction.guildId!)),
                ),
            )
            .execute();
    });

    // Return success.
    return success(
        interaction,
        "Balance Moved",
        "The balance has been successfully moved.",
    );
}

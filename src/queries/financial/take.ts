import { and, eq, sql } from "drizzle-orm";
import { client, transactions, wallet } from "../../database";
import rowsAffected from "../../database/rowsAffected";

export default (
    guildId: bigint, userId: bigint, amount: bigint, reason: string,
) => "batch" in client ? client.transaction(async tx => {
    // Take the money from the user.
    const updateResult = await tx.update(wallet).set({
        balance: sql`${wallet.balance} - ${amount}`,
    }).where(and(
        eq(wallet.guildId, guildId),
        eq(wallet.userId, userId),
        sql`${wallet.balance} >= ${amount}`,
    ));

    // If a row wasn't updated, return false.
    if (rowsAffected(updateResult) !== 1) return false;

    // Insert the transaction.
    await tx.insert(transactions).values({
        createdAt: new Date(),
        guildId, userId, amount: -amount,
        reason,
    }).run();

    // Return true.
    return true;
}) : client.transaction(tx => {
    // Take the money from the user.
    const updateResult = tx.update(wallet).set({
        balance: sql`${wallet.balance} - ${amount}`,
    }).where(and(
        eq(wallet.guildId, guildId),
        eq(wallet.userId, userId),
        sql`${wallet.balance} >= ${amount}`,
    )).run();

    // If a row wasn't updated, return false.
    if (rowsAffected(updateResult) !== 1) return false;

    // Insert the transaction
    tx.insert(transactions).values({
        createdAt: new Date(),
        guildId, userId, amount: -amount,
        reason,
    }).run();

    // Return true.
    return true;
});

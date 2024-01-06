import { and, eq, gte, sql } from "drizzle-orm";
import { client, transactions, wallet } from "../../database";

export default (
    guildId: bigint, sourceUserId: bigint, targetUserId: bigint,
    amount: bigint, outboundReason: string, inboundReason?: string,
) => client.transaction(async tx => {
    // Go ahead and try to take the money from the source user.
    const updateResult = await tx.update(wallet).set({
        balance: sql`${wallet.balance} - ${amount}`,
    }).where(and(
        eq(wallet.guildId, guildId),
        eq(wallet.userId, sourceUserId),
        gte(wallet.balance, amount),
    ));

    // If a row wasn't updated, return false.
    if (updateResult.rowsAffected !== 1) return false;

    // Insert the transaction to the source user.
    await tx.insert(transactions).values({
        createdAt: new Date(),
        guildId, userId: sourceUserId, amount: -amount,
        reason: outboundReason,
    });

    // Add to the target user.
    await tx.insert(wallet).values({
        guildId, userId: targetUserId, balance: amount,
    }).onConflictDoUpdate({
        target: [wallet.guildId, wallet.userId],
        set: {
            balance: sql`${wallet.balance} + ${amount}`,
        },
    });

    // Insert the transaction to the target user.
    await tx.insert(transactions).values({
        createdAt: new Date(),
        guildId, userId: targetUserId, amount,
        reason: inboundReason || outboundReason,
    });

    // Return true.
    return true;
});

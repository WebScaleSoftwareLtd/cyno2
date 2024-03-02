import { sql } from "drizzle-orm";
import { client, transactions, wallet } from "../../database";

export default async (guildId: bigint, userIds: bigint[], amount: bigint, reason: string) => {
    if ("batch" in client) return await client.batch([
        client.insert(wallet).values(userIds.map(userId => ({
            guildId,
            userId,
            balance: amount,
        }))).onConflictDoUpdate({
            target: [wallet.guildId, wallet.userId],
            set: {
                balance: sql`${wallet.balance} + ${amount}`,
            },
        }),

        client.insert(transactions).values(userIds.map(userId => ({
            createdAt: new Date(),
            guildId, userId, amount, reason,
        }))),
    ]);

    // Fall back to serial execution.
    for (const userId of userIds) {
        client.insert(wallet).values({
            guildId,
            userId,
            balance: amount,
        }).onConflictDoUpdate({
            target: [wallet.guildId, wallet.userId],
            set: {
                balance: sql`${wallet.balance} + ${amount}`,
            },
        }).run();

        client.insert(transactions).values({
            createdAt: new Date(),
            guildId, userId, amount, reason,
        }).run();
    }
};

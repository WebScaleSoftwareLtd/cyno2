import { sql } from "drizzle-orm";
import { client, transactions, wallet } from "../../database";

export default async (guildId: bigint, userIds: bigint[], amount: bigint, reason: string) => {
    return client.batch([
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
};

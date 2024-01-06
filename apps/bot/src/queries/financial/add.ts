import { sql } from "drizzle-orm";
import { client, transactions, wallet } from "../../database";

export default async (guildId: bigint, userId: bigint, amount: bigint, reason: string) => {
    const v = await client.batch([
        client.insert(wallet).values({
            guildId,
            userId,
            balance: amount,
        }).onConflictDoUpdate({
            target: [wallet.guildId, wallet.userId],
            set: {
                balance: sql`${wallet.balance} + ${amount}`,
            },
        }).returning({ balance: wallet.balance }),

        client.insert(transactions).values({
            createdAt: new Date(),
            guildId, userId, amount, reason,
        }),
    ]);
    return v[0][0]?.balance || amount;
};

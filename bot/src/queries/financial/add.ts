import { sql } from "drizzle-orm";
import { client, transactions, wallet } from "database";

export default async (
    guildId: bigint,
    userId: bigint,
    amount: number,
    reason: string,
) => {
    const q1 = await client
        .insert(wallet)
        .values({
            guildId,
            userId,
            balance: amount,
        })
        .onConflictDoUpdate({
            target: [wallet.guildId, wallet.userId],
            set: {
                balance: sql`${wallet.balance} + ${amount}`,
            },
        })
        .returning({ balance: wallet.balance });
    await client.insert(transactions).values({
        createdAt: new Date(),
        guildId,
        userId,
        amount,
        reason,
    });
    return q1[0]?.balance || amount;
};

import { client, transactions, wallet } from "database";

export default (guildId: bigint, userId: bigint, balance: bigint, reason: string) => client.transaction(async tx => {
    // Select the wallet row.
    const walletRow = await tx.query.wallet.findFirst({
        where: (tx, { and, eq }) => and(
            eq(tx.guildId, guildId),
            eq(tx.userId, userId),
        ),
    });
    let balanceBefore = 0n;
    if (walletRow) {
        // Set the balance before to the old balance.
        balanceBefore = walletRow.balance;
    }

    // Update the wallet row.
    await tx.insert(wallet).values({
        guildId, userId, balance,
    }).onConflictDoUpdate({
        target: [wallet.guildId, wallet.userId],
        set: { balance },
    });

    // Insert the transaction.
    await tx.insert(transactions).values({
        createdAt: new Date(),
        guildId, userId, amount: balance - balanceBefore, reason,
    }).run();
});

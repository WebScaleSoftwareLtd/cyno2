import { client, transactions } from "../../database";
import { Button, Embed } from "react-djs";

export type DisplayedTransactions = {
    page: typeof transactions.$inferSelect[];
    pageNumber: number;
    endPage: boolean;
};

export const loadTransactions = async (
    gid: bigint, uid: bigint, pageNumber: number,
): Promise<DisplayedTransactions> => {
    const transactions = await client.query.transactions.findMany({
        where: (tx, { and, eq }) => and(
            eq(tx.guildId, gid),
            eq(tx.userId, uid),
        ),
        limit: 6,
        offset: (pageNumber - 1) * 5,
        orderBy: (txs, { desc }) => desc(txs.createdAt),
    }).execute();
    const endPage = transactions.length < 6;
    if (!endPage) transactions.pop();
    return {
        page: transactions,
        pageNumber,
        endPage,
    };
};

type Props = {
    displayedTransactions: DisplayedTransactions;
    setDisplayedTransactions: (transactions: DisplayedTransactions | undefined) => void;
    uid: bigint;
    gid: bigint;
    emoji: string;
};

export const TransactionPage = ({
    displayedTransactions, setDisplayedTransactions, uid, gid,
    emoji,
}: Props) => <>
    <Embed
        fields={displayedTransactions.page.map(tx => {
            const timestamp = tx.createdAt.getTime() / 1000;
            return {
                name: `${tx.amount} ${emoji} (<t:${timestamp}:f>)`,
                value: tx.reason,
                inline: false,
            };
        })}
    />

    <Button
        label="Show Balance" onClick={() => setDisplayedTransactions(undefined)}
        emoji="🔼"
    />
    {
        displayedTransactions.pageNumber !== 1 && <Button
            label="Previous Page" onClick={async () => setDisplayedTransactions(
                await loadTransactions(gid, uid, displayedTransactions.pageNumber - 1)
            )} emoji="⬅️"
        />
    }
    {
        !displayedTransactions.endPage && <Button
            label="Next Page" onClick={async () => setDisplayedTransactions(
                await loadTransactions(gid, uid, displayedTransactions.pageNumber + 1)
            )} emoji="➡️"
        />
    }
</>;

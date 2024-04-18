import { useState } from "react";
import {
    TransactionPage,
    DisplayedTransactions,
    loadTransactions,
} from "./TransactionPage";
import { Button, Embed } from "react-djs";

type Props = {
    uid: bigint;
    gid: bigint;
    balance: number | undefined;
    self: boolean;
    emoji: string;
};

export default ({ uid, gid, balance, self, emoji }: Props) => {
    const [displayedTransactions, setDisplayedTransactions] = useState<
        DisplayedTransactions | undefined
    >();

    if (displayedTransactions) {
        return (
            <TransactionPage
                displayedTransactions={displayedTransactions}
                setDisplayedTransactions={setDisplayedTransactions}
                uid={uid}
                gid={gid}
                emoji={emoji}
            />
        );
    }

    const header = self ? "You currently have" : `<@${uid}> currently has`;
    return (
        <>
            <Embed description={`${header} ${emoji} ${balance || 0}`} />
            {balance !== undefined && (
                <Button
                    label="View Transactions"
                    onClick={async () =>
                        setDisplayedTransactions(
                            await loadTransactions(gid, uid, 1),
                        )
                    }
                />
            )}
        </>
    );
};

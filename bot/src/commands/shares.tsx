import { CommandInteraction } from "discord.js";
import { useState } from "react";
import { Button, Embed } from "react-djs";
import yahooFinance from "yahoo-finance2";
import { client, shares } from "database";
import { getGuild } from "../queries/guild";
import { renderManager } from "../state";
import { eq } from "drizzle-orm";
import add from "../queries/financial/add";

export const description = "Lists your users shares.";

type ShareValue = typeof shares.$inferSelect & {
    value: number;
    shareLabel: string | undefined;
};

type DisplayedShares = {
    page: ShareValue[];
    pageNumber: number;
    endPage: boolean;
};

const loadShares = async (
    gid: bigint,
    uid: bigint,
    pageNumber: number,
): Promise<DisplayedShares> => {
    // Keep going until page 1 || shares are found.
    for (;;) {
        // Load the shares from the database.
        const shares = await client.query.shares
            .findMany({
                where: (tx, { and, eq }) =>
                    and(eq(tx.guildId, gid), eq(tx.userId, uid)),
                limit: 6,
                offset: (pageNumber - 1) * 5,
                orderBy: (txs, { desc }) => desc(txs.createdAt),
            })
            .execute();

        // Handle checking if there is extra data.
        const endPage = shares.length < 6;
        if (!endPage) shares.pop();

        // Query for the share prices.
        const sharePromises = await Promise.all(
            [...new Set(shares.map((share) => share.stockName))].map(
                async (stockName) => {
                    return (async () =>
                        [
                            stockName,
                            await yahooFinance.quote(stockName, {
                                fields: ["regularMarketPrice", "shortName"],
                            }),
                        ] as const)().catch(
                        () => [stockName, undefined] as const,
                    );
                },
            ),
        );

        // If shares are empty, check if we can go back a page.
        if (shares.length === 0) {
            if (pageNumber === 1)
                return { page: [], pageNumber: 1, endPage: true };
            pageNumber--;
            continue;
        }

        // Return the shares.
        return {
            page: shares.map((share) => {
                const shareData = sharePromises.find(
                    ([stockName]) => stockName === share.stockName,
                )!;
                const shareLabel = shareData[1]?.shortName;
                const value = shareData[1]
                    ? Math.floor(
                          share.shareCount * shareData[1].regularMarketPrice!,
                      )
                    : share.invested;
                return { ...share, value, shareLabel };
            }),
            pageNumber,
            endPage,
        };
    }
};

type SharedProps = {
    uid: bigint;
    gid: bigint;
    emoji: string;
};

type ViewState =
    | { shares: DisplayedShares }
    | { share: ShareValue; pageNumber: number };

type PageProps = SharedProps & {
    displayedShares: DisplayedShares;
    setView: (res: ViewState) => void;
};

const renderShareDescription = (
    emoji: string,
    tx: ShareValue,
) => `Bought ${tx.shareCount} shares at ${emoji} ${tx.invested}

**Current Value**: ${emoji} ${tx.value}`;

const SharesPage = ({
    displayedShares,
    setView,
    uid,
    gid,
    emoji,
}: PageProps) => (
    <>
        <Embed
            fields={displayedShares.page.map((tx, i) => {
                const timestamp = tx.createdAt.getTime() / 1000;
                return {
                    name: `Share ${i + 1}: ${tx.shareLabel || "Unknown Share"} (<t:${timestamp}:f>)`,
                    value: renderShareDescription(emoji, tx),
                    inline: false,
                };
            })}
        />

        {displayedShares.pageNumber !== 1 && (
            <Button
                label="Previous Page"
                onClick={async () =>
                    setView({
                        shares: await loadShares(
                            gid,
                            uid,
                            displayedShares.pageNumber - 1,
                        ),
                    })
                }
                emoji="⬅️"
            />
        )}
        {!displayedShares.endPage && (
            <Button
                label="Next Page"
                onClick={async () =>
                    setView({
                        shares: await loadShares(
                            gid,
                            uid,
                            displayedShares.pageNumber + 1,
                        ),
                    })
                }
                emoji="➡️"
            />
        )}

        {displayedShares.page.map((tx, i) => (
            <Button
                label={`Manage Share ${i + 1}`}
                onClick={() =>
                    setView({
                        share: tx,
                        pageNumber: displayedShares.pageNumber,
                    })
                }
                key={i}
            />
        ))}
    </>
);

type ShareProps = SharedProps & {
    share: ShareValue;
    pageNumber: number;
    setView: (res: ViewState) => void;
};

const ManageShare = ({
    uid,
    gid,
    share,
    pageNumber,
    setView,
    emoji,
}: ShareProps) => {
    const sellShare = async () => {
        // Delete the share.
        const res = await client
            .delete(shares)
            .where(eq(shares.id, share.id))
            .execute();

        // If the share was deleted, pay the user.
        if (res.rowsAffected !== 0) {
            await add(
                gid,
                uid,
                BigInt(share.value),
                `Sold ${share.shareCount} shares in ${share.shareLabel || "Unknown Share"}`,
            );
        }

        // Load the shares.
        setView({ shares: await loadShares(gid, uid, pageNumber) });
    };

    return (
        <>
            <Embed description={renderShareDescription(emoji, share)} />

            <Button
                label="Show Shares"
                onClick={async () => {
                    setView({ shares: await loadShares(gid, uid, pageNumber) });
                }}
                emoji="🔼"
            />

            <Button label="Sell Share" onClick={sellShare} emoji="💰" />
        </>
    );
};

type Props = SharedProps & {
    initialPage: DisplayedShares;
};

const Router = ({ uid, gid, emoji, initialPage }: Props) => {
    const [state, setState] = useState<ViewState>({ shares: initialPage });

    if ("shares" in state) {
        // Handle if the user has no shares.
        if (state.shares.page.length === 0) {
            return <Embed description="You currently have no shares." />;
        }

        // Render the shares page.
        return (
            <SharesPage
                displayedShares={state.shares}
                setView={setState}
                uid={uid}
                gid={gid}
                emoji={emoji}
            />
        );
    }

    return (
        <ManageShare
            share={state.share}
            pageNumber={state.pageNumber}
            setView={setState}
            uid={uid}
            gid={gid}
            emoji={emoji}
        />
    );
};

export async function run(interaction: CommandInteraction) {
    // Get the interaction information.
    const gid = BigInt(interaction.guildId!);
    const uid = BigInt(interaction.user.id);
    const guild = await getGuild(BigInt(interaction.guildId!));

    // Load the shares.
    const initialPage = await loadShares(gid, uid, 1);

    // Render the router.
    renderManager.reply(
        interaction,
        <Router
            uid={uid}
            gid={gid}
            emoji={guild.currencyEmoji}
            initialPage={initialPage}
        />,
        { ephemeral: true },
    );
}

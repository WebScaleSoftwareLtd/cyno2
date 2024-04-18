import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
    type EmbedField,
} from "discord.js";
import { useState } from "react";
import { client } from "database";
import { getGuild } from "../queries/guild";
import { renderManager } from "../state";
import { Button, Embed } from "react-djs";

type PageResult = {
    fields: EmbedField[];
    endPage: boolean;
};

type Props = {
    initPageResult: PageResult;
    pageLoader: (page: number) => Promise<PageResult>;
};

const Leaderboard = ({ initPageResult, pageLoader }: Props) => {
    // Defines the page we are currently on.
    const [page, setPage] = useState({ page: 1, result: initPageResult });

    // Handles rendering a page.
    let renderPage: (page: number) => Promise<void>;
    renderPage = async (page) => {
        // Call the page loader.
        let result = await pageLoader(page);

        // If there are no fields, use page 1.
        if (result.fields.length === 0 && page !== 1) return renderPage(1);

        // Update the page.
        setPage({ page, result });
    };

    // Handles if the page is blank.
    if (page.result.fields.length === 0) {
        return (
            <Embed description="There is currently nobody on this leaderboard." />
        );
    }

    // Return the embed.
    return (
        <>
            <Embed fields={page.result.fields} />
            {page.page !== 1 && (
                <Button
                    label="Previous Page"
                    onClick={() => renderPage(page.page - 1)}
                    emoji="⬅️"
                />
            )}
            {!page.result.endPage && (
                <Button
                    label="Next Page"
                    onClick={() => renderPage(page.page + 1)}
                    emoji="➡️"
                />
            )}
        </>
    );
};

export const description = "Displays the guilds leaderboards.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "type",
        description: "The type of leaderboard you want.",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: "XP",
                value: "xp",
            },
            {
                name: "Balance",
                value: "balance",
            },
        ],
    },
];

export async function run(interaction: CommandInteraction) {
    // Get the guild/user ID.
    const gid = BigInt(interaction.guildId!);

    // Get the currency emoji.
    const guild = await getGuild(gid);

    // Defines the wallet page loader.
    let pageLoader: (page: number) => Promise<PageResult> = async (page) => {
        // Get the database result.
        const res = await client.query.wallet.findMany({
            where: (xp, { eq }) => eq(xp.guildId, gid),
            limit: 6,
            offset: (page - 1) * 5,
            orderBy: (w, { desc }) => desc(w.balance),
        });
        const endPage = res.length < 6;
        if (!endPage) res.pop();

        // Return the embed fields.
        return {
            fields: res.map((w) => {
                return {
                    name: `<@${w.userId}>`,
                    value: `${guild.currencyEmoji} ${w.balance}`,
                    inline: true,
                };
            }),
            endPage,
        };
    };

    // Defines the XP page loader.
    if (interaction.options.get("type")!.value === "xp") {
        pageLoader = async (page) => {
            // Get the database result.
            const res = await client.query.experiencePoints.findMany({
                where: (xp, { eq }) => eq(xp.guildId, gid),
                limit: 6,
                offset: (page - 1) * 5,
                orderBy: (x, { desc }) => desc(x.totalXp),
            });
            const endPage = res.length < 6;
            if (!endPage) res.pop();

            // Return the embed fields.
            return {
                fields: res.map((x) => {
                    return {
                        name: `<@${x.userId}>`,
                        value: `Level ${x.level} (${x.xp} XP)`,
                        inline: true,
                    };
                }),
                endPage,
            };
        };
    }

    // Run the handler and render the React component.
    const page = await pageLoader(1);
    renderManager.reply(
        interaction,
        <Leaderboard initPageResult={page} pageLoader={pageLoader} />,
        { ephemeral: true },
    );
}

import React from "react";
import { client } from "database";
import * as schema from "database/schema";
import dbCache from "./dbCache";
import getGuild from "./getGuild";
import { sql } from "drizzle-orm";
import DiscordEmojiPicker from "../molecules/DiscordEmojiPicker";
import EagerState from "../atoms/EagerState";
import OptionCard from "../atoms/OptionCard";
import getEmojis from "./getEmojis";
import Loading from "../atoms/Loading";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;

    title: string;
    description: string;
};

async function ServerEmojiInput<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(props: Props<TableName, ColumnName>) {
    // Get the record and emojis.
    const [record, emojis] = await Promise.all([
        dbCache(props.tableName, props.guildId),
        getEmojis(props.guildId),
    ]);
    console.log(emojis);

    // Get the default value.
    let defaultValue = "";
    if (record) defaultValue = (record as any)[props.column];

    // Change the value on the server.
    async function change(value: string) {
        "use server";

        // Check the user has permission.
        if (!await getGuild(props.guildId)) throw new Error("No permission.");

        // Ensure this is a string.
        if (typeof value !== "string") throw new Error("Not a string.");

        // Update the value on the database.
        await client.insert(schema[props.tableName]).values({
            // @ts-ignore: It existed earlier or we wouldn't be here.
            guildId: BigInt(props.guildId),
            [props.column]: value,
        }).onConflictDoUpdate({
            target: sql`guild_id`,

            // @ts-ignore: This definitely exists.
            set: {
                [props.column]: value,
            },
        }).execute();
    }

    // Render the picker wrapped in a eager state.
    return <EagerState
        component={DiscordEmojiPicker}
        initialValue={defaultValue}
        props={{ emojis }}
        update={change}
    />;
}

export default async function AsyncComponent<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(props: Props<TableName, ColumnName>) {
    return (
        <OptionCard
            title={props.title} description={props.description}
        >
            <React.Suspense fallback={<Loading />}>
                <ServerEmojiInput {...props} />
            </React.Suspense>
        </OptionCard>
    );
}

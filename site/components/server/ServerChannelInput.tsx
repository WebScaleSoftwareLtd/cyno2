import React from "react";
import * as schema from "database/schema";
import OptionCard from "../atoms/OptionCard";
import Loading from "../atoms/Loading";
import getGuildChannels from "./cached/getGuildChannels";
import dbCache from "./cached/dbCache";
import { client } from "database";
import getGuild from "./cached/getGuild";
import { sql } from "drizzle-orm";
import ChannelPicker from "../atoms/ChannelPicker";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;
    multiple: boolean;

    title: string;
    description: string;
};

async function getChannelRecords<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(tableName: TableName, column: ColumnName, guildId: string, multiple: boolean) {
    // Get one record if it's not multiple.
    if (!multiple) {
        const record = await dbCache(tableName, guildId);
        return record ? [(record as any)[column] as bigint] : [];
    }

    // Get all the records.
    return client.query[tableName].findMany({
        // @ts-ignore: This definitely exists.
        columns: { [column]: true },

        // @ts-ignore: This definitely exists.
        where: (row, { eq }) => eq(row.guildId, BigInt(guildId)),
    }).execute().then((rows) => rows.map((row) => (row as any)[column] as bigint));
}

async function AsyncComponent<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>({ tableName, column, guildId, multiple }: Props<TableName, ColumnName>) {
    // Get the channels and records.
    const [channels, records] = await Promise.all([
        getGuildChannels(guildId),
        getChannelRecords(tableName, column, guildId, multiple),
    ]);

    // Remove a record from the database.
    async function remove(channelId: bigint) {
        "use server";

        // Check the user has permission.
        if (!await getGuild(guildId)) throw new Error("No permission.");

        // Check if this is a bigint.
        if (typeof channelId !== "bigint") throw new Error("Not a bigint.");

        // Delete the value on the database.
        await client.delete(schema[tableName]).where({
            // @ts-ignore: It existed earlier or we wouldn't be here.
            guildId: BigInt(guildId),
            [column]: channelId,
        }).execute();
    }

    // Insert a record into the database.
    async function insert(channelId: bigint) {
        "use server";

        // Check the user has permission.
        if (!await getGuild(guildId)) throw new Error("No permission.");

        // Check if this is a bigint.
        if (typeof channelId !== "bigint") throw new Error("Not a bigint.");

        // Insert the value on the database.
        await client.insert(schema[tableName]).values({
            // @ts-ignore: It existed earlier or we wouldn't be here.
            guildId: BigInt(guildId),
            [column]: channelId,
        }).onConflictDoUpdate({
            target: sql`guild_id`,

            // @ts-ignore: This definitely exists.
            set: {
                [column]: channelId,
            },
        }).execute();
    }

    // Return the channel picker.
    return <ChannelPicker
        channels={channels}
        records={records}
        remove={remove}
        insert={insert}
        multiple={multiple}
    />;
}

export default async function ServerChannelInput<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(props: Props<TableName, ColumnName>) {
    return (
        <OptionCard title={props.title} description={props.description}>
            <React.Suspense fallback={<Loading />}>
                <AsyncComponent {...props} />
            </React.Suspense>
        </OptionCard>
    );
}

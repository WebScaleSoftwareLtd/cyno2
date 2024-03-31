import React from "react";
import * as schema from "database/schema";
import { RolePicker } from "../atoms/RolePicker";
import getGuildRoles from "./cached/getGuildRoles";
import OptionCard from "../atoms/OptionCard";
import Loading from "../atoms/Loading";
import dbCache from "./cached/dbCache";
import EagerState from "../atoms/EagerState";
import getGuild from "./cached/getGuild";
import { client } from "database";
import { sql } from "drizzle-orm";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof (typeof schema)[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;

    title: string;
    description: string;
};

async function AsyncComponent<
    TableName extends keyof typeof schema,
    ColumnName extends keyof (typeof schema)[TableName],
>({ tableName, column, guildId }: Props<TableName, ColumnName>) {
    // Get the record and roles.
    const [record, roles] = await Promise.all([
        dbCache(tableName, guildId),
        getGuildRoles(guildId),
    ]);
    let defaultValue: string | null = null;
    if (record) defaultValue = (record as any)[column].toString();

    // Update the role on the server.
    async function update(roleId: string) {
        "use server";

        // Check the user has permission.
        if (!(await getGuild(guildId))) throw new Error("No permission.");

        // Check this is actually a string.
        if (typeof roleId !== "string") throw new Error("Not a string.");

        // Update the value on the database.
        await client
            .insert(schema[tableName])
            .values({
                // @ts-ignore: It existed earlier or we wouldn't be here.
                guildId: BigInt(guildId),
                [column]: BigInt(roleId),
            })
            .onConflictDoUpdate({
                target: sql`guild_id`,

                // @ts-ignore: This definitely exists.
                set: {
                    [column]: BigInt(roleId),
                },
            })
            .execute();
    }

    // Return the role picker wrapped in a eager state.
    return (
        <EagerState
            component={RolePicker}
            initialValue={defaultValue}
            props={{ roles }}
            update={update}
        />
    );
}

export default async function ServerRoleInput<
    TableName extends keyof typeof schema,
    ColumnName extends keyof (typeof schema)[TableName],
>(props: Props<TableName, ColumnName>) {
    // Make this suspenseful since it might take a while but render the card immediately.
    return (
        <OptionCard title={props.title} description={props.description}>
            <React.Suspense fallback={<Loading />}>
                <AsyncComponent {...props} />
            </React.Suspense>
        </OptionCard>
    );
}

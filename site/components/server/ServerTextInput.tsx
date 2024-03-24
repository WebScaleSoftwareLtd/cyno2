import { client } from "database";
import * as schema from "database/schema";
import dbCache from "./dbCache";
import getGuild from "./getGuild";
import { sql } from "drizzle-orm";
import TextInput from "../molecules/TextInput";
import React from "react";
import { Validator, constructValidator } from "@/utils/jsonTextValidator";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;
    validator?: Validator;

    title: string;
    description: string;
};

export default async function ServerTextInput<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(props: Props<TableName, ColumnName>) {
    // Get the table and value.
    const record = await dbCache(props.tableName, props.guildId);
    let defaultValue = "";
    if (record) defaultValue = (record as any)[props.column];

    // Change the value on the server.
    async function change(value: string) {
        "use server";

        // Validate the value.
        if (props.validator) constructValidator(props.validator).parse(value);

        // Check the user has permission.
        if (!await getGuild(props.guildId)) throw new Error("No permission.");

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

    // Render the number input.
    return <TextInput
        title={props.title}
        description={props.description}
        defaultValue={defaultValue}
        validator={props.validator}
        onChange={change}
    />;
}

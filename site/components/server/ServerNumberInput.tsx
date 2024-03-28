import { client } from "database";
import * as schema from "database/schema";
import dbCache from "./cached/dbCache";
import getGuild from "./cached/getGuild";
import { sql } from "drizzle-orm";
import NumberInput from "../molecules/NumberInput";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;
    default?: number;
    min?: number;
    max?: number;

    title: string;
    description: string;
};

export default async function ServerNumberInput<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(props: Props<TableName, ColumnName>) {
    // Get the table and value.
    const record = await dbCache(props.tableName, props.guildId);
    let defaultValue = props.default === undefined ? 0 : props.default;
    if (record) defaultValue = (record as any)[props.column];

    // Change the value on the server.
    async function change(value: number) {
        "use server";

        // Make sure this is actually a number.
        if (typeof value !== "number") throw new Error("Not a boolean.");

        // Check the user has permission.
        if (!await getGuild(props.guildId)) throw new Error("No permission.");

        // Make sure the value is within the bounds.
        if (props.min !== undefined && value < props.min) throw new Error("Below minimum.");
        if (props.max !== undefined && value > props.max) throw new Error("Above maximum.");

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
    return <NumberInput
        title={props.title}
        description={props.description}
        defaultValue={defaultValue}
        min={props.min}
        max={props.max}
        onChange={change}
    />;
}

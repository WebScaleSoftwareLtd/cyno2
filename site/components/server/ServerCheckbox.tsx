import { client } from "database";
import * as schema from "database/schema";
import dbCache from "./dbCache";
import getGuild from "./getGuild";
import { sql } from "drizzle-orm";
import Checkbox from "../molecules/Checkbox";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;
    default?: boolean;

    title: string;
    description: string;
};

export default async function ServerCheckbox<
    TableName extends keyof typeof schema,
    ColumnName extends keyof typeof schema[TableName],
>(props: Props<TableName, ColumnName>) {
    // Get the table and value.
    const record = await dbCache(props.tableName, props.guildId);
    let defaultValue = !!props.default;
    if (record) defaultValue = !!(record as any)[props.column];

    // Change the value on the server.
    async function change(value: boolean) {
        "use server";

        // Make sure this is actually a boolean.
        if (typeof value !== "boolean") throw new Error("Not a boolean.");

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

    // Render the checkbox.
    return <Checkbox
        title={props.title}
        description={props.description}
        defaultValue={defaultValue}
        onChange={change}
    />;
}

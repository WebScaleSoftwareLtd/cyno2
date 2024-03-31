import { client } from "database";
import * as schema from "database/schema";
import { sql } from "drizzle-orm";
import { FileRouter } from "../external/uploadthing";
import OptionCard from "../atoms/OptionCard";
import EagerState from "../atoms/EagerState";
import ClientUploader from "../atoms/ClientUploader";
import getGuild from "./cached/getGuild";
import dbCache from "./cached/dbCache";

type Props<
    TableName extends keyof typeof schema,
    ColumnName extends keyof (typeof schema)[TableName],
> = {
    tableName: TableName;
    column: ColumnName;
    guildId: string;
    endpoint: keyof FileRouter;

    title: string;
    description: string;
};

export default async function ServerFileUpload<
    TableName extends keyof typeof schema,
    ColumnName extends keyof (typeof schema)[TableName],
>(props: Props<TableName, ColumnName>) {
    // Get the table and value.
    const record = await dbCache(props.tableName, props.guildId);
    let defaultValue: string | null = null;
    if (record) defaultValue = (record as any)[props.column];

    // Handle the table update.
    async function update(value: string) {
        "use server";

        // Check the user has permission.
        if (!(await getGuild(props.guildId))) throw new Error("No permission.");

        // Ensure this is a string.
        if (typeof value !== "string") throw new Error("Not a string.");

        // Update the value on the database.
        await client
            .insert(schema[props.tableName])
            .values({
                // @ts-ignore: It existed earlier or we wouldn't be here.
                guildId: BigInt(props.guildId),
                [props.column]: value,
            })
            .onConflictDoUpdate({
                target: sql`guild_id`,

                // @ts-ignore: This definitely exists.
                set: {
                    [props.column]: value,
                },
            })
            .execute();
    }

    // Return the option card.
    return (
        <OptionCard title={props.title} description={props.description}>
            <EagerState
                component={ClientUploader}
                initialValue={defaultValue}
                props={{ endpoint: props.endpoint }}
                update={update}
            />
        </OptionCard>
    );
}

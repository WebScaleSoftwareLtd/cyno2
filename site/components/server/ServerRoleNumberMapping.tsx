import * as schema from "database/schema";
import React from "react";
import Loading from "../atoms/Loading";
import OptionCard from "../atoms/OptionCard";
import getGuild from "./cached/getGuild";
import { client } from "database";
import { and, eq, sql } from "drizzle-orm";
import { ClientRoleMapping } from "../molecules/ClientRoleMapping";
import getGuildRoles from "./cached/getGuildRoles";

type Props<
    TableName extends keyof typeof schema,
    RoleColumnName extends keyof (typeof schema)[TableName],
    NumberColumnName extends keyof (typeof schema)[TableName],
> = {
    tableName: TableName;
    roleColumn: RoleColumnName;
    numberColumn: NumberColumnName;
    numberColumnName: string;
    guildId: string;

    title: string;
    description: string;
    min?: number;
    max?: number;
};

async function getRolesFromDb<
    TableName extends keyof typeof schema,
    RoleColumnName extends keyof (typeof schema)[TableName],
    NumberColumnName extends keyof (typeof schema)[TableName],
>(
    tableName: TableName,
    roleColumn: RoleColumnName,
    numberColumn: NumberColumnName,
    guildId: string,
): Promise<{ [key: string]: number | bigint }[]> {
    return client.query[tableName]
        .findMany({
            // @ts-ignore: This definitely exists.
            columns: { [roleColumn]: true, [numberColumn]: true },

            // @ts-ignore: This definitely exists.
            where: (row, { eq }) => eq(row.guildId, BigInt(guildId)),
        })
        .execute() as Promise<{ [key: string]: number | bigint }[]>;
}

async function AsyncComponent<
    TableName extends keyof typeof schema,
    RoleColumnName extends keyof (typeof schema)[TableName],
    NumberColumnName extends keyof (typeof schema)[TableName],
>({
    tableName,
    roleColumn,
    numberColumn,
    numberColumnName,
    guildId,
    min,
    max,
}: Props<TableName, RoleColumnName, NumberColumnName>) {
    // Get both the Discord roles and the rows at the same time.
    const [roles, records] = await Promise.all([
        getGuildRoles(guildId),
        getRolesFromDb(tableName, roleColumn, numberColumn, guildId),
    ]);

    // Defines the server function to remove a role.
    async function remove(roleId: string) {
        "use server";

        // Check the user has permission.
        if (!(await getGuild(guildId))) throw new Error("No permission.");

        // Ensure the role is actually a string.
        if (typeof roleId !== "string") throw new Error("Not a string.");

        // Delete the value on the database.
        await client
            .delete(schema[tableName])
            .where(
                and(
                    // @ts-ignore: It existed earlier or we wouldn't be here.
                    eq(schema[tableName].guildId, BigInt(guildId)),

                    // @ts-ignore: This definitely exists.
                    eq(schema[tableName][roleColumn], BigInt(roleId)),
                ),
            )
            .execute();
    }

    // Defines the server function to add a role.
    async function create(roleId: string, number: number) {
        "use server";

        // Check the user has permission.
        if (!(await getGuild(guildId))) throw new Error("No permission.");

        // Ensure the role is actually a string.
        if (typeof roleId !== "string") throw new Error("Not a string.");

        // Ensure the number is actually a number.
        if (typeof number !== "number") throw new Error("Not a number.");

        // Make sure the role exists. For some reason, Next doesn't see this as a server component if
        // I don't do it this way.
        // The better code: if (!roles.find(role => role.id === roleId)) throw new Error("Role doesn't exist.");
        let found = false;
        for (const role of roles) {
            if (role.id === roleId) {
                found = true;
                break;
            }
        }
        if (!found) throw new Error("Role doesn't exist.");

        // Make sure the number is within the bounds.
        if (min !== undefined && number < min)
            throw new Error("Below minimum.");
        if (max !== undefined && number > max)
            throw new Error("Above maximum.");

        // Update the value on the database.
        await client
            .insert(schema[tableName])
            .values({
                // @ts-ignore: It existed earlier or we wouldn't be here.
                guildId: BigInt(guildId),
                [roleColumn]: BigInt(roleId),
                [numberColumn]: number,
            })
            .onConflictDoUpdate({
                target: sql`role_id`,

                // @ts-ignore: This definitely exists.
                set: {
                    [roleColumn]: BigInt(roleId),
                    [numberColumn]: number,
                },
            })
            .execute();
    }

    // Render the client component.
    return (
        <ClientRoleMapping
            roles={roles}
            records={records}
            roleColumn={roleColumn as string}
            numberColumn={numberColumn as string}
            numberColumnName={numberColumnName}
            remove={remove}
            create={create}
            min={min}
            max={max}
        />
    );
}

export default async function ServerRoleNumberMapping<
    TableName extends keyof typeof schema,
    RoleColumnName extends keyof (typeof schema)[TableName],
    NumberColumnName extends keyof (typeof schema)[TableName],
>(props: Props<TableName, RoleColumnName, NumberColumnName>) {
    // Make this suspenseful since it might take a while but render the card immediately.
    return (
        <OptionCard title={props.title} description={props.description}>
            <React.Suspense fallback={<Loading />}>
                <AsyncComponent {...props} />
            </React.Suspense>
        </OptionCard>
    );
}

"use client";

import React from "react";
import Button from "../atoms/Button";
import { RolePicker, Role } from "../atoms/RolePicker";

type ClientInputProps = {
    roles: Role[];
    roleColumn: string;
    numberColumn: string;
    records: {[key: string]: number | bigint}[];
    create: (roleId: string, number: number) => Promise<void>;
    min?: number;
    max?: number;
};

function ClientInput(props: ClientInputProps) {
    const [roleId, setRoleId] = React.useState(null as string | null);
    const [number, setNumber] = React.useState(props.min ?? 0);

    const submit = React.useCallback(() => {
        // Check if it already exists.
        if (roleId === null) return;
        const roleIdBigInt = BigInt(roleId);
        for (const r of props.records) {
            if (r[props.roleColumn] === roleIdBigInt) return;
        }

        // Add the role.
        props.create(roleId, number);
    }, [roleId, number]);

    return (
        <tr>
            <td className="md:min-w-56">
                <RolePicker
                    roles={props.roles}
                    value={roleId}
                    onChange={setRoleId}
                />
            </td>

            <td>
                <input
                    type="number"
                    value={number}
                    onChange={e => {
                        const v = parseInt(e.target.value);
                        if (isNaN(v)) return;
                        setNumber(v);
                    }}
                    className="w-full p-2 dark:bg-gray-900 rounded-lg ml-2"
                    min={props.min}
                    max={props.max}
                />
            </td>

            <td>
                <div className="ml-4">
                    <Button
                        action={submit}
                        label="Add"
                        style="link"
                    />
                </div>
            </td>
        </tr>
    );
}

type Props = {
    roles: Role[];
    records: {[key: string]: number | bigint}[];
    roleColumn: string;
    numberColumn: string;
    numberColumnName: string;
    remove: (roleId: string) => Promise<void>;
    create: (roleId: string, number: number) => Promise<void>;
    min?: number;
    max?: number;
};

type ClientRowProps = {
    roles: Role[];
    roleId: string;
    number: number;
    remove: (roleId: string) => Promise<void>;
};

function ClientRow({ roles, roleId, number, remove }: ClientRowProps) {
    const [hidden, setHidden] = React.useState(false);

    const matchedRole = roles.find(role => role.id === roleId);
    return (
        <tr className={hidden ? "hidden" : ""}>
            <td className="pl-2">
                {
                    matchedRole ? <span style={{ color: `#${matchedRole.color.toString(16)}` }}>
                        {matchedRole.name}
                    </span> : <i>Role not found.</i>
                }
            </td>
            <td className="pl-4">{number}</td>

            <td className="pl-4">
                <Button
                    action={() => {
                        setHidden(true);
                        remove(roleId).catch(e => {
                            setHidden(false);
                            console.error(e);
                        });
                    }}
                    style="danger"
                />
            </td>
        </tr>
    );
}

export function ClientRoleMapping(props: Props) {
    const [records, setRecords] = React.useState(props.records);

    return (
        <table className="table-fixed border-separate border-spacing-2">
            <thead>
                <tr>
                    <th>Role</th>
                    <th>{props.numberColumnName}</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
                {
                    records.map(
                        (record, index) => <ClientRow
                            key={index} roles={props.roles}
                            roleId={record[props.roleColumn].toString()}
                            number={record[props.numberColumn] as number}
                            remove={async () => {
                                await props.remove(record[props.roleColumn].toString());
                                records.splice(index, 1);
                                setRecords([...records]);
                            }}
                        />
                    )
                }
            </tbody>

            <tfoot>
                <ClientInput
                    roles={props.roles}
                    roleColumn={props.roleColumn}
                    numberColumn={props.numberColumn}
                    records={records}
                    create={async (roleId, number) => {
                        await props.create(roleId, number);
                        setRecords([...records, {
                            [props.roleColumn]: BigInt(roleId),
                            [props.numberColumn]: number,
                        }]);
                    }}
                    min={props.min}
                    max={props.max}
                />
            </tfoot>
        </table>
    );
}

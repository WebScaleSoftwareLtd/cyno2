"use client";

import React from "react";
import Button from "../atoms/Button";
import { RolePicker, Role } from "../atoms/RolePicker";

type ClientInputProps = {
    roles: Role[];
    roleColumn: string;
    numberColumn: string;
    records: {[key: string]: number | bigint}[];
    setRecords: (records: {[key: string]: number | bigint}[]) => void;
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
        props.create(roleId, number).then(() => {
            props.setRecords([...props.records, {
                [props.roleColumn]: roleIdBigInt,
                [props.numberColumn]: number,
            }]);
        });
    }, [roleId, number]);

    return (
        <tr>
            <td>
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
                    min={props.min}
                    max={props.max}
                />
            </td>

            <td>
                <Button
                    action={submit}
                    label="Add"
                    style="link"
                />
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
            <td>
                {
                    matchedRole ? <span style={{ color: `#${matchedRole.color.toString(16)}` }}>
                        {matchedRole.name}
                    </span> : <i>Role not found.</i>
                }
            </td>
            <td>{number}</td>

            <td>
                <button onClick={() => {
                    setHidden(true);
                    remove(roleId).catch(e => {
                        setHidden(false);
                        console.error(e);
                    });
                }}>
                    &times;
                </button>
            </td>
        </tr>
    );
}

export function ClientRoleMapping(props: Props) {
    const [records, setRecords] = React.useState(props.records);

    return (
        <table className="w-full">
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
                    setRecords={setRecords}
                    create={props.create}
                    min={props.min}
                    max={props.max}
                />
            </tfoot>
        </table>
    );
}

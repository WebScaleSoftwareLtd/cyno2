"use client";

import React from "react";

export type Role = {
    id: string;
    name: string;
    color: number;
};

type ClientInputProps = {
    roles: Role[];
    records: {[key: string]: number | bigint}[];
    setRecords: (records: {[key: string]: number | bigint}[]) => void;
    create: (roleId: string, number: number) => Promise<void>;
    min?: number;
    max?: number;
};

function ClientInput(props: ClientInputProps) {
    return <></>;
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
                <tr>
                    
                </tr>
            </tfoot>
        </table>
    );
}

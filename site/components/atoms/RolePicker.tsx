"use client";

import Select from "react-select";

export type Role = {
    id: string;
    name: string;
    color: number;
};

type Props = {
    roles: Role[];
    value: string | null;
    onChange: (value: string) => void;
};

export function RolePicker({ roles, value, onChange }: Props) {
    return <Select
        defaultValue={<i>No role selected.</i>}
        isSearchable={true}
    />;
}

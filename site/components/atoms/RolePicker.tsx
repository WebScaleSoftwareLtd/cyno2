"use client";

import Select from "react-select";
import selectTailwindClasses from "../utils/selectTailwindClasses";

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

function RoleLabel({ role }: { role: Role }) {
    if (role.color === 0) return role.name;
    return (
        <div style={{ color: `#${role.color.toString(16).padStart(6, "0")}` }}>
            {role.name}
        </div>
    );
}

export function RolePicker({ roles, value, onChange }: Props) {
    // Get the options.
    const options = roles.map((role) => ({
        value: role.name,
        data: role.id,
        label: <RoleLabel role={role} key={role.id} />,
    }));

    // Remove @everyone.
    options.shift();

    // Get the currently selected value.
    const selected = options.find((role) => role.data === value);

    // Return the select component.
    return (
        <Select
            isSearchable={true}
            isClearable={false}
            defaultValue={selected}
            options={options}
            onChange={(value) => {
                if (value) onChange(value.data);
            }}
            classNames={selectTailwindClasses}
        />
    );
}

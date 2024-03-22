"use client";

type Props = {
    title: string;
    description: string;
    defaultValue: boolean;
    onChange: (value: boolean) => Promise<void>;
};

export default function Checkbox(props: Props) {
    return String(props.defaultValue);
}

"use client";

import Link from "next/link";

const buttonStyles = {
    standard: "text-nowrap select-none bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-950 disabled:bg-gray-300 disabled:text-gray-400 disabled:dark:bg-gray-600 disabled:dark:text-gray-300",
    link: "text-nowrap select-none bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500 dark:bg-blue-900 dark:hover:bg-blue-950 disabled:bg-blue-300 disabled:text-gray-400",
} as const;

export type ButtonProps = {
    style: keyof typeof buttonStyles;
    label: string;
    disabled?: boolean;
} & ({ action: () => void } | { link: string });

export default function Button(props: ButtonProps) {
    let action = () => {};
    if ("link" in props) {
        if (!props.disabled) return (
            <p>
                <Link
                    href={props.link} className={buttonStyles[props.style]}
                >
                    {props.label}
                </Link>
            </p>
        );
    } else {
        action = props.action;
    }

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            action();
        }}>
            <button
                type="submit" className={buttonStyles[props.style]}
                disabled={props.disabled}
            >
                {props.label}
            </button>
        </form>
    );
}

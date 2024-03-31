"use client";

import Link from "next/link";

const buttonStyles = {
    standard:
        "text-nowrap select-none bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-950 disabled:bg-gray-300 disabled:text-gray-400 disabled:dark:bg-gray-600 disabled:dark:text-gray-300",
    link: "text-nowrap select-none bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500 dark:bg-blue-900 dark:hover:bg-blue-950 disabled:bg-blue-300 disabled:text-gray-400",
    danger: "text-nowrap select-none bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 dark:bg-red-900 dark:hover:bg-red-950 disabled:bg-red-300 disabled:text-gray-400",
} as const;

type StandardButtonProps = {
    style: keyof typeof buttonStyles;
    disabled?: boolean;
} & ({ action: () => void } | { link: string });

export type ButtonProps =
    | ({ style: "danger" } & StandardButtonProps)
    | ({
          label: string;
      } & StandardButtonProps);

export default function Button(props: ButtonProps) {
    let action = () => {};
    if ("link" in props) {
        if (!props.disabled)
            return (
                <p>
                    <Link
                        href={props.link}
                        className={buttonStyles[props.style]}
                    >
                        {props.style === "danger" ? "×" : props.label}
                    </Link>
                </p>
            );
    } else {
        action = props.action;
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                action();
            }}
        >
            <button
                type="submit"
                className={buttonStyles[props.style]}
                disabled={props.disabled}
                aria-label={props.style === "danger" ? "Delete" : props.label}
            >
                {props.style === "danger" ? "×" : props.label}
            </button>
        </form>
    );
}

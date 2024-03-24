"use client";

import React from "react";

const styles = {
    error: "bg-red-500 dark:bg-red-700",
} as const;

type Props = React.PropsWithChildren<{
    severity: keyof typeof styles;
}>;

export default function Alert({ children, severity }: Props) {
    return (
        <div className={`p-4 rounded-lg ${styles[severity]} text-white w-full`}>
            {children}
        </div>
    );
}

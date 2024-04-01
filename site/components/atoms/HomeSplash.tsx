"use client";

import React from "react";

export default function HomeSplash({ children }: React.PropsWithChildren<{}>) {
    return (
        <header
            className="flex flex-col items-center justify-center h-64 bg-gradient-to-r from-blue-600 to-cyan-600
            dark:from-blue-900 dark:to-cyan-900"
        >
            {children}
        </header>
    );
}

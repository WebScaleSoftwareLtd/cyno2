"use client";

import React from "react";

type Props = React.PropsWithChildren<{
    title: string;
    description: string;
}>;

export default function OptionCard({ title, description, children }: Props) {
    return (
        <div className="bg-gray-100 dark:bg-gray-950 p-8 m-2 rounded-lg select-none w-full shadow-md">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-700 dark:text-gray-200 mt-2 mb-4">{description}</p>

            {children}
        </div>
    );
}

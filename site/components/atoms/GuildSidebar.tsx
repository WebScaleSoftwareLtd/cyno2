"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const options = [
    {
        key: "Levelling",
        suffix: "",
    },
    {
        key: "Economy",
        suffix: "/economy",
    },
    {
        key: "Birthdays",
        suffix: "/birthdays",
    },
] as const;

const ALL_NUMBERS = /^[0-9]+$/;

type SidebarButtonProps = {
    title: string;
    active: boolean;
    uri: string;
};

function SidebarButton({ title, active, uri }: SidebarButtonProps) {
    return (
        <Link
            href={uri}
            className={`font-bold w-full px-2 ${active && "text-blue-500 dark:text-blue-400"}`}
            aria-selected={active}
        >
            {title}
        </Link>
    );
}

export default function GuildSidebar({ guildId }: { guildId: string }) {
    const pathname = usePathname();

    // Figure out the current suffix.
    const split = pathname.split("/");
    let suffix = split.pop()!;
    if (suffix === "") suffix = split.pop()!;
    if (ALL_NUMBERS.test(suffix)) {
        suffix = "";
    } else {
        suffix = `/${suffix}`;
    }

    // Create a sidebar.
    const endIndex = options.length - 1;
    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg sm:mr-8 mr-0 sm:mb-0 mb-6 shadow-lg">
                {options.map((opts, index) => {
                    return (
                        <React.Fragment key={opts.key}>
                            <SidebarButton
                                title={opts.key}
                                active={opts.suffix === suffix}
                                uri={`/dashboard/${guildId}${opts.suffix}`}
                            />
                            {index !== endIndex && (
                                <hr className="my-2 border-gray-200 dark:border-gray-800" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <hr className="my-4 sm:hidden border-gray-200 dark:border-gray-800" />
        </>
    );
}

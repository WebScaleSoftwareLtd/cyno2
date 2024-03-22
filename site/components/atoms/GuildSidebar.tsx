"use client";

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
        key: "Permissions",
        suffix: "/permissions",
    },
    {
        key: "Birthdays",
        suffix: "/birthdays",
    },
] as const;

const ALL_NUMBERS = /^[0-9]+$/;

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

    // TODO: Create a sidebar.
    return <p>{pathname}</p>;
}

import { cookies } from "next/headers";
import getDiscordToken from "./getDiscordToken";

export type Guild = {
    id: string;
    name: string;
    owner: boolean;
    permissions: string;
    icon: string | null;
};

export default async function (): Promise<Guild[] | null> {
    const token = await getDiscordToken();
    if (!token) return null;

    const response = await fetch(
        "https://discord.com/api/v10/users/@me/guilds",
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        },
    );
    if (!response.ok) return null;
    return await response.json();
}

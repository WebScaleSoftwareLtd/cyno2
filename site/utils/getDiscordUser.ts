import { cookies } from "next/headers";
import getDiscordToken from "./getDiscordToken";

export type User = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
};

export default async function (): Promise<User | null> {
    const token = await getDiscordToken();
    if (!token) return null;

    const response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    if (!response.ok) {
        cookies().delete("encrypted_token");
        return null;
    }
    return await response.json();
}

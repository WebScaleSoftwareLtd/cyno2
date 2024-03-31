import { cache } from "react";

export type Channel = {
    name: string;
    id: string;
};

async function getGuildChannels(guildId: string): Promise<Channel[]> {
    return (await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.TOKEN}`,
            },
        },
    )).json();
}

export default cache(getGuildChannels);

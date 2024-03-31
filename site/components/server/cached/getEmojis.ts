import { cache } from "react";
import type { DiscordEmoji } from "../../molecules/DiscordEmojiPicker";

async function getEmojis(guildId: string): Promise<DiscordEmoji[]> {
    return (
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/emojis`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.TOKEN}`,
            },
        })
    ).json();
}

export default cache(getEmojis);

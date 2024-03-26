import { cache } from "react";
import { Role } from "../atoms/RolePicker";

async function getGuildRoles(guildId: string): Promise<Role[]> {
    return (await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/roles`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            },
        },
    )).json();
}

export default cache(getGuildRoles);

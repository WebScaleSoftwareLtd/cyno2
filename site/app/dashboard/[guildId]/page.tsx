import { notFound } from "next/navigation";
import getGuild from "./getGuild";

export default async function GuildLevelling(
    { params }: { params: { guildId: string } }
) {
    // Get the guild.
    const guild = await getGuild(params.guildId);
    if (!guild) return notFound();

    return (
        <>
            Hello World!
        </>
    );
}

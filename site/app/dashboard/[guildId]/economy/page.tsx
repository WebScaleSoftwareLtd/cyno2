import { notFound } from "next/navigation";
import getGuild from "../getGuild";

export default async function GuildEconomy(
    { params }: { params: { guildId: string } }
) {
    // Check we have permissions for this guild.
    const guild = await getGuild(params.guildId);
    if (!guild) return notFound();

    // Return the configuration options for this page.
    return (
        <>
            Hello World!
        </>
    );
}

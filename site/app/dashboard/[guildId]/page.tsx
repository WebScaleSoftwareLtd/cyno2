import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "./withGuild";
import ServerCheckbox from "@/components/server/ServerCheckbox";

async function GuildLevelling({ guild }: { guild: Guild }) {
    return (
        <>
            <ServerCheckbox
                tableName="guilds"
                column="xpEnabled"
                guildId={guild.id}
                title="Enable XP"
                description="Enable or disable the XP system."
            />
        </>
    );
}

export default withGuild(GuildLevelling);

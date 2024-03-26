import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "../withGuild";
import ServerRoleInput from "@/components/server/ServerRoleInput";

async function GuildPermissions({ guild }: { guild: Guild }) {
    return (
        <>
            
        </>
    );
}

export default withGuild(GuildPermissions);

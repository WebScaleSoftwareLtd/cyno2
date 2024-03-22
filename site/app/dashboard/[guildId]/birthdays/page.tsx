import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "../withGuild";

async function GuildBirthdays({ guild }: { guild: Guild }) {
    // Return the configuration options for this page.
    return (
        <>
            Hello World!
        </>
    );
}

export default withGuild(GuildBirthdays);

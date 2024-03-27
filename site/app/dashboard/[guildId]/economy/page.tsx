import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "../withGuild";
import ServerEmojiInput from "@/components/server/ServerEmojiPicker";

async function GuildEconomy({ guild }: { guild: Guild }) {
    // Return the configuration options for this page.
    return (
        <>
            <ServerEmojiInput
                tableName="guilds"
                column="currencyEmoji"
                title="Currency Emoji"
                description="This option defines the emoji that will be used for currency."
                guildId={guild.id}
            />
        </>
    );
}

export default withGuild(GuildEconomy);

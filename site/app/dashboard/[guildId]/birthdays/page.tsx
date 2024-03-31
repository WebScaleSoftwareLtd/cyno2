import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "../withGuild";
import ServerRoleInput from "@/components/server/ServerRoleInput";
import ServerTextInput from "@/components/server/ServerTextInput";
import ServerNumberInput from "@/components/server/ServerNumberInput";
import ServerChannelInput from "@/components/server/ServerChannelInput";

async function GuildBirthdays({ guild }: { guild: Guild }) {
    return (
        <>
            <ServerRoleInput
                tableName="guildBirthdayConfig"
                column="roleId"
                guildId={guild.id}
                title="Birthday Role"
                description="This option defines the role that will be set on a users birthday and removed automatically afterwards."
            />

            <ServerTextInput
                tableName="guildBirthdayConfig"
                column="birthdayMessage"
                guildId={guild.id}
                validator={{
                    max: 1000,
                    min: 1,
                }}
                title="Birthday Message"
                description="This option defines the message that will be sent to a channel on a users birthday."
            />

            <ServerChannelInput
                tableName="guildBirthdayConfig"
                column="channelId"
                guildId={guild.id}
                multiple={false}
                title="Birthday Channel"
                description="This option defines the channel that the birthday message will be sent to."
            />

            <ServerNumberInput
                tableName="guildBirthdayConfig"
                column="currency"
                min={0}
                guildId={guild.id}
                title="Birthday Currency"
                description="This option defines the amount of currency a user will get on their birthday."
            />
        </>
    );
}

export default withGuild(GuildBirthdays);

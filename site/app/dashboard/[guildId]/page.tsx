import withGuild from "./withGuild";
import { Guild } from "@/utils/getDiscordGuilds";
import ServerCheckbox from "@/components/server/ServerCheckbox";
import ServerNumberInput from "@/components/server/ServerNumberInput";
import ServerTextInput from "@/components/server/ServerTextInput";
import ServerRoleNumberMapping from "@/components/server/ServerRoleNumberMapping";

async function GuildLevelling({ guild }: { guild: Guild }) {
    return (
        <>
            <ServerCheckbox
                tableName="guilds"
                column="xpEnabled"
                guildId={guild.id}
                title="Enable Levelling"
                description="This option enables the ability for users to collect XP."
            />

            <ServerNumberInput
                tableName="guilds"
                column="levelMultiplier"
                guildId={guild.id}
                min={1}
                title="Level Multiplier"
                description="This option defines the level multiplier for levels."
            />

            <ServerTextInput
                tableName="guilds"
                column="levelUpMessage"
                guildId={guild.id}
                title="Level Up Message"
                description="This option defines the message sent for leveling up."
                validator={{
                    max: 1000,
                    min: 1,
                }}
            />

            <ServerCheckbox
                tableName="guilds"
                column="levelUpDM"
                guildId={guild.id}
                title="Level Up DM"
                description="Defines if the level up message should be sent in direct messages."
            />

            <ServerRoleNumberMapping
                tableName="levelRoles"
                numberColumn="level"
                numberColumnName="Level"
                roleColumn="roleId"
                min={1}
                title="Level Roles"
                description="Defines the roles given for reaching a certain level."
                guildId={guild.id}
            />
        </>
    );
}

export default withGuild(GuildLevelling);

import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "../withGuild";
import Section from "@/components/server/Section";
import ServerEmojiInput from "@/components/server/ServerEmojiPicker";
import ServerRoleNumberMapping from "@/components/server/ServerRoleNumberMapping";
import ServerCheckbox from "@/components/server/ServerCheckbox";
import ServerNumberInput from "@/components/server/ServerNumberInput";
import ServerFileUpload from "@/components/server/ServerFileUpload";
import ServerTextInput from "@/components/server/ServerTextInput";
import ServerChannelInput from "@/components/server/ServerChannelInput";

async function GuildEconomy({ guild }: { guild: Guild }) {
    return (
        <>
            <Section title="Currency Usage">
                <ServerEmojiInput
                    tableName="guilds"
                    column="currencyEmoji"
                    title="Currency Emoji"
                    description="This option defines the emoji that will be used for currency."
                    guildId={guild.id}
                />

                <ServerRoleNumberMapping
                    tableName="roleShop"
                    numberColumn="price"
                    numberColumnName="Cost"
                    roleColumn="roleId"
                    guildId={guild.id}
                    title="Role Shop Items"
                    description="Select roles which are in the role shop."
                />
            </Section>

            <Section title="Currency Drops">
                <ServerCheckbox
                    tableName="guilds"
                    column="dropsEnabled"
                    guildId={guild.id}
                    title="Drops Enabled"
                    description="This option defines if currency drops are enabled."
                />

                <ServerNumberInput
                    tableName="guilds"
                    column="dropAmountMin"
                    guildId={guild.id}
                    min={1}
                    title="Minimum Drop Amount"
                    description="This option defines the minimum amount of currency that can drop."
                />

                <ServerNumberInput
                    tableName="guilds"
                    column="dropAmountMax"
                    guildId={guild.id}
                    min={1}
                    title="Maximum Drop Amount"
                    description="This option defines the maximum amount of currency that can drop."
                />

                <ServerNumberInput
                    tableName="guilds"
                    column="dropBlanks"
                    guildId={guild.id}
                    min={0}
                    max={5}
                    title="Drop Blanks"
                    description="This option defines the number of blank buttons on a currency drop embed."
                />

                <ServerFileUpload
                    tableName="guilds"
                    column="dropImage"
                    guildId={guild.id}
                    endpoint="imageUrlUploader"
                    title="Drop Image"
                    description="This option defines the image that will be used for currency drops."
                />

                <ServerTextInput
                    tableName="guilds"
                    column="dropMessage"
                    guildId={guild.id}
                    title="Drop Message"
                    description="This option defines the message that will be sent for currency drops."
                    validator={{
                        max: 1000,
                        min: 1,
                    }}
                />

                <ServerNumberInput
                    tableName="guilds"
                    column="dropSecondsCooldown"
                    guildId={guild.id}
                    min={0}
                    title="Drop Cooldown"
                    description="This option defines the number of seconds cooldown between drops."
                />

                <ServerChannelInput
                    tableName="allowedDropChannels"
                    column="channelId"
                    guildId={guild.id}
                    multiple={true}
                    title="Drop Channels"
                    description="This option defines the channels where drops are allowed."
                />
            </Section>

            <Section title="Timely Functionality">
                <ServerCheckbox
                    tableName="guildTimelyConfig"
                    column="enabled"
                    guildId={guild.id}
                    title="Timely Enabled"
                    description="This option enables the timely command. This command allows the user to pick up the amount of currency every number of hours specified."
                />

                <ServerNumberInput
                    tableName="guildTimelyConfig"
                    column="amount"
                    guildId={guild.id}
                    min={1}
                    title="Timely Amount"
                    description="This option defines the amount the user can pick up from a timely collection."
                />

                <ServerNumberInput
                    tableName="guildTimelyConfig"
                    column="hoursBetweenCollections"
                    guildId={guild.id}
                    min={1}
                    title="Hours Between Collections"
                    description="This option defines the number of hours before the user is allowed another timely collection."
                />
            </Section>
        </>
    );
}

export default withGuild(GuildEconomy);

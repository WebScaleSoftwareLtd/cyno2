import { Guild } from "@/utils/getDiscordGuilds";
import withGuild from "../withGuild";
import Section from "@/components/server/Section";
import ServerEmojiInput from "@/components/server/ServerEmojiPicker";
import ServerRoleNumberMapping from "@/components/server/ServerRoleNumberMapping";
import ServerCheckbox from "@/components/server/ServerCheckbox";
import ServerNumberInput from "@/components/server/ServerNumberInput";

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
            </Section>
        </>
    );
}

export default withGuild(GuildEconomy);

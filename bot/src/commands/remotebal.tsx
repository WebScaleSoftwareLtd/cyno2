import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type PermissionResolvable,
    type CommandInteraction,
} from "discord.js";
import { getGuild } from "../queries/guild";
import { client } from "database";
import { renderManager } from "../state";
import Balance from "./shared/Balance";

export const description =
    "Allows you to remotely check someone else's balance.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "user",
        description: "The user to check the balance of.",
        type: ApplicationCommandOptionType.User,
        required: true,
    },
];

export const defaultPermissions: PermissionResolvable = [
    "Administrator",
    "ManageGuild",
    "ManageMessages",
];

export async function run(interaction: CommandInteraction) {
    const uid = BigInt(interaction.options.getUser("user")!.id);
    const guild = await getGuild(BigInt(interaction.guildId!));

    const wallet = await client.query.wallet
        .findFirst({
            where: (wallets, { and, eq }) =>
                and(
                    eq(wallets.userId, uid),
                    eq(wallets.guildId, BigInt(interaction.guildId!)),
                ),
        })
        .execute();

    renderManager.reply(
        interaction,
        <Balance
            uid={uid}
            gid={BigInt(interaction.guildId!)}
            balance={wallet?.balance}
            emoji={guild.currencyEmoji}
            self={false}
        />,
        { ephemeral: true },
    );
}

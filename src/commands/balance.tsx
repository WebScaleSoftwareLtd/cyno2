import type { CommandInteraction } from "discord.js";
import { client } from "../database";
import { renderManager } from "../state";
import { getGuild } from "../queries/guild";
import Balance from "./shared/Balance";

export const description = "Get your current balance and transactions.";

export async function run(interaction: CommandInteraction) {
    const guild = await getGuild(BigInt(interaction.guildId!));

    const wallet = await client.query.wallet.findFirst({
        where: (wallets, { and, eq }) => and(
            eq(wallets.userId, BigInt(interaction.user.id)),
            eq(wallets.guildId, BigInt(interaction.guildId!)),
        ),
    }).execute();

    renderManager.reply(interaction, <Balance
        uid={BigInt(interaction.user.id)}
        gid={BigInt(interaction.guildId!)}
        balance={wallet?.balance}
        emoji={guild.currencyEmoji}
        self={true}
    />, { ephemeral: true });
}

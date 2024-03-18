import type { Client, CommandInteraction, EmbedField, Role } from "discord.js";
import { useState } from "react";
import { client, guilds, roleShop } from "../database";
import { renderManager } from "../state";
import { getGuild } from "../queries/guild";
import { Button, Embed } from "react-djs";
import take from "../queries/financial/take";
import add from "../queries/financial/add";

type Props = {
    guild: typeof guilds.$inferSelect;
    uid: bigint;
    client: Client;
    guildRoles: Role[];
    soldRoles: typeof roleShop.$inferSelect[];
    initMemberRoles: string[];
    initBalance: bigint;
};

const RoleShop = ({ guild, uid, client, guildRoles, soldRoles, initMemberRoles, initBalance }: Props) => {
    const [memberRoles, setMemberRoles] = useState(initMemberRoles);
    const [offset, setOffset] = useState(0);
    const [balance, setBalance] = useState(initBalance);
    const [applyError, setApplyError] = useState(false);

    if (applyError) {
        return <>
            <Embed
                title="Failed To Apply Role"
                description="The role was unable to be added to your user due to permission issues. You have been refunded."
                color={0xFF0000}
            />
            <Button
                label="Return to Shop" onClick={() => setApplyError(false)}
            />
        </>;
    }

    if (soldRoles.length === 0) {
        return <Embed
            description="There are currently no roles for sale in this server."
        />;
    }

    const page = soldRoles.slice(offset, offset + 6);
    const endPage = page.length < 6;
    if (!endPage) page.pop();

    const buttons: JSX.Element[] = [];
    const fields: EmbedField[] = [];
    page.forEach(({ roleId, price }, pageIndex) => {
        // Get the role.
        const roleIdS = `${roleId}`;
        const role = guildRoles.find(r => r.id === roleIdS);
        if (!role) return;

        // Get the description and create the button.
        let description = `Tag Preview: <@&${roleIdS}>\n`;
        const owned = memberRoles.includes(roleIdS);
        if (owned) {
            // The user owns this role.
            description += "You already have this role.";
        } else {
            // The user does not own this role.
            if (balance >= BigInt(price)) {
                description += `Click the button below to buy this role for ${guild.currencyEmoji} ${price}.`;

                // Add the button.
                buttons.push(<Button
                    label={`Buy ${role.name}`} onClick={async () => {
                        // Take the money for the role.
                        await take(guild.guildId, uid, BigInt(price), `Bought <@&${roleIdS}>`);

                        // Add the role to the user.
                        try {
                            await client.guilds.cache.get(`${guild.guildId}`)?.
                                members.cache.get(`${uid}`)?.roles.add(roleIdS, "Bought from role shop");
                        } catch {
                            // Refund the user and return.
                            await add(guild.guildId, uid, BigInt(price), "Refund: Role apply failed");
                            setApplyError(true);
                            return;
                        }

                        // Update the state.
                        setMemberRoles([...memberRoles, roleIdS]);
                        setBalance(balance - BigInt(price));
                    }} key={pageIndex + offset}
                />);
            } else {
                description += `You require ${guild.currencyEmoji} ${price} to buy this role.`;
            }
        }

        // Return the field.
        fields.push({
            name: role.name,
            value: description,
            inline: false,
        });
    });

    return <>
        <Embed fields={fields} />
        {
            offset !== 0 && <Button
                label="Previous Page" onClick={() => setOffset(offset - 5)}
                emoji="⬅️"
            />
        }
        {
            !endPage && <Button
                label="Next Page" onClick={() => setOffset(offset + 5)}
                emoji="➡️"
            />
        }
        {buttons}
    </>;
}

export const description = "Lists all roles for sale and lets you buy them.";

export async function run(interaction: CommandInteraction) {
    // Get interaction information.
    const roles = interaction.guild!.roles.cache;
    const gid = BigInt(interaction.guildId!);
    const memberRoles = interaction.member!.roles as string[];

    // Do the database queries.
    const soldRoles = await client.query.roleShop.findMany({
        where: (role, { eq }) => eq(role.guildId, gid),
    }).execute();
    const guild = await getGuild(gid);
    const balance = (await client.query.wallet.findFirst({
        where: (wallet, { and, eq }) => and(
            eq(wallet.guildId, gid),
            eq(wallet.userId, BigInt(interaction.user.id)),
        ),
    }).execute())?.balance ?? BigInt(0);

    // Render the component.
    renderManager.reply(interaction, <RoleShop
        guild={guild}
        uid={BigInt(interaction.user.id)}
        client={interaction.client}
        guildRoles={[...roles.values()]}
        soldRoles={soldRoles}
        initMemberRoles={memberRoles}
        initBalance={balance}
    />, { ephemeral: true });
}

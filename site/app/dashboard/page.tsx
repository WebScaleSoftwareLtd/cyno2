import React from "react";
import getDiscordGuilds from "@/utils/getDiscordGuilds";
import Loading from "@/components/atoms/Loading";
import KillLogin from "@/components/atoms/KillLogin";
import GuildCards from "@/components/atoms/GuildCards";
import { client } from "database";
import type { User } from "@/utils/getDiscordUser";
import getUser from "@/components/server/cached/getUser";
import inviteUrl from "@/utils/inviteUrl";

async function Guilds() {
    // Get the users guilds.
    const guildsArray = await getDiscordGuilds();
    if (!guildsArray) return <KillLogin />;

    // Get all the guilds this bot is in that are mutual.
    const mutualGuilds = (
        await client.query.guilds.findMany({
            columns: { guildId: true },
            where: (guilds, { and, inArray, isNull }) =>
                and(
                    inArray(
                        guilds.guildId,
                        guildsArray.map((guild) => BigInt(guild.id)),
                    ),
                    isNull(guilds.destroyAt),
                ),
        })
    ).map((x) => x.guildId.toString());

    // Generate 4 arrays:
    // 1) Has permissions to edit Cyno in the guild, Cyno added.
    // 2) Doesn't have permissions to edit Cyno in the guild, Cyno added.
    // 3) Has permissions to add Cyno.
    // 4) Doesn't have permissions to add Cyno.

    // Initially to do this, we want to split out the ones with it added into 2 arrays.
    const nonMutualDiscordGuilds = [];
    const mutualDiscordGuilds = [];
    for (const guild of guildsArray) {
        if (mutualGuilds.includes(guild.id)) {
            mutualDiscordGuilds.push(guild);
        } else {
            nonMutualDiscordGuilds.push(guild);
        }
    }

    // Cache the user when checking the database.
    let userCached: User | null = null;
    const magicThrowObj = {};
    const getUserFromVar = async () => {
        if (userCached) return userCached;
        userCached = await getUser();
        if (!userCached) throw magicThrowObj;
        return userCached;
    };
    const isAdmin = async (guildId: bigint) => {
        const uid = (await getUserFromVar()).id;
        return client.query.dashboardAdmins.findFirst({
            where: (admins, { and, eq }) =>
                and(
                    eq(admins.userId, BigInt(uid)),
                    eq(admins.guildId, guildId),
                ),
        });
    };

    // On the mutual guilds, we want to find the ones where we have permissions.
    let haveItems = 0;
    const canManageServer = [];
    const cannotManageServer = [];
    try {
        for (const guild of mutualDiscordGuilds) {
            if (
                guild.owner || // Owner can always manage the server.
                BigInt(guild.permissions) & BigInt(0x20) || // Manage Server
                (await isAdmin(BigInt(guild.id))) // Is a dashboard admin.
            ) {
                canManageServer.push(guild);
            } else {
                cannotManageServer.push(guild);
            }
        }
    } catch (e) {
        // Handle if the session dies.
        if (e !== magicThrowObj) throw e;
        return <KillLogin />;
    }
    if (canManageServer.length > 0) haveItems++;
    if (cannotManageServer.length > 0) haveItems++;

    // On the non-mutual guilds, we want to find the ones where we can add it.
    const noManageServer = [];
    const manageServer = [];
    for (const guild of nonMutualDiscordGuilds) {
        if (BigInt(guild.permissions) & BigInt(0x20)) {
            manageServer.push(guild);
        } else {
            noManageServer.push(guild);
        }
    }
    if (manageServer.length > 0) haveItems++;
    if (noManageServer.length > 0) haveItems++;

    // Show the guilds.
    return (
        <>
            {canManageServer.length > 0 && (
                <>
                    <GuildCards
                        cards={canManageServer.map((guild) => {
                            return {
                                buttonText: "Dashboard",
                                enabled: true,
                                guildId: guild.id,
                                guildName: guild.name,
                                guildImage: guild.icon,
                                url: `/dashboard/${guild.id}`,
                            };
                        })}
                        title="Configurable Guilds"
                        description="These are guilds that you have permission to configure the bot in."
                    />

                    {--haveItems > 0 && (
                        <hr className="my-4 border-gray-200 dark:border-gray-800" />
                    )}
                </>
            )}

            {cannotManageServer.length > 0 && (
                <>
                    <GuildCards
                        cards={cannotManageServer.map((guild) => {
                            return {
                                buttonText: "Dashboard",
                                enabled: false,
                                guildId: guild.id,
                                guildName: guild.name,
                                guildImage: guild.icon,
                                url: `/dashboard/${guild.id}`,
                            };
                        })}
                        title="Unconfigurable Guilds"
                        description="These are guilds that have this instance of Cyno but you do not have permission to configure it."
                    />

                    {--haveItems > 0 && (
                        <hr className="my-4 border-gray-200 dark:border-gray-800" />
                    )}
                </>
            )}

            {manageServer.length > 0 && (
                <>
                    <GuildCards
                        cards={manageServer.map((guild) => {
                            return {
                                buttonText: "Add",
                                enabled: true,
                                guildId: guild.id,
                                guildName: guild.name,
                                guildImage: guild.icon,
                                url: inviteUrl(guild.id),
                            };
                        })}
                        title="Addable Guilds"
                        description="These are guilds that you can add this instance of Cyno to."
                    />

                    {--haveItems > 0 && (
                        <hr className="my-4 border-gray-200 dark:border-gray-800" />
                    )}
                </>
            )}

            {noManageServer.length > 0 && (
                <>
                    <GuildCards
                        cards={noManageServer.map((guild) => {
                            return {
                                buttonText: "Add",
                                enabled: false,
                                guildId: guild.id,
                                guildName: guild.name,
                                guildImage: guild.icon,
                                url: inviteUrl(guild.id),
                            };
                        })}
                        title="Unaddable Guilds"
                        description="These are guilds that you do not have permission to add this instance of Cyno to."
                    />
                </>
            )}
        </>
    );
}

export default async function SelectGuild() {
    return (
        <main className="m-12">
            <h1 className="text-3xl font-bold">Select a Guild</h1>
            <p className="text-gray-500 dark:text-gray-200 mt-4">
                Select a guild to change its configuration:
            </p>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <React.Suspense fallback={<Loading />}>
                <Guilds />
            </React.Suspense>
        </main>
    );
}

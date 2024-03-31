import React from "react";
import { redirect } from "next/navigation";
import Button from "@/components/atoms/Button";
import GuildSidebar from "@/components/atoms/GuildSidebar";
import Loading from "@/components/atoms/Loading";
import getGuild from "@/components/server/cached/getGuild";

type Props = React.PropsWithChildren<{ params: { guildId: string } }>;

async function GuildLayout({ params, children }: Props) {
    // Get the guild.
    const guild = await getGuild(params.guildId);
    if (!guild) return redirect("/");

    // Return the layout which the configuration gets rendered into.
    return (
        <>
            <div className="flex justify-between items-center mb-4 flex-wrap">
                <div className="flex items-center space-x-4">
                    <img
                        src={
                            guild.icon
                                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                                : `https://cdn.discordapp.com/embed/avatars/0.png`
                        }
                        alt=""
                        className="mx-auto w-12 h-12 rounded-full"
                        loading="lazy"
                    />
                    <h1 className="text-2xl font-semibold">{guild.name}</h1>
                </div>
                <div className="xs:mt-0 mt-6 xs:mb-0 mb-4">
                    <Button
                        link="/dashboard"
                        label="Back to Dashboard"
                        style="link"
                    />
                </div>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="flex max-sm:flex-wrap">
                <div className="flex-col sm:flex-grow-0 sm:w-auto w-full">
                    <GuildSidebar guildId={guild.id} />
                </div>

                <div className="flex-col flex-grow">
                    <div className="relative">{children}</div>
                </div>
            </div>
        </>
    );
}

export default async function AsyncGuildLayout(props: Props) {
    return (
        <main className="m-12">
            <div className="max-w-5xl mx-auto">
                <React.Suspense fallback={<Loading />}>
                    <GuildLayout {...props} />
                </React.Suspense>
            </div>
        </main>
    );
}

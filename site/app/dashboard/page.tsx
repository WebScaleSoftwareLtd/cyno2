import React from "react";
import Loading from "@/components/atoms/Loading";
import getDiscordGuilds from "@/utils/getDiscordGuilds";
import KillLogin from "@/components/atoms/KillLogin";

async function Guilds() {
    // Get the users guilds.
    const guilds = await getDiscordGuilds();
    if (!guilds) return <KillLogin />;

    // Show the guilds.
    return JSON.stringify(guilds);
}

export default async function SelectGuild() {
    return (
        <main>
            <h1 className="text-3xl font-bold">Select a Guild</h1>
            <p className="text-gray-500 dark:text-gray-200">Select a guild to change its configuration:</p>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <React.Suspense fallback={<Loading />}>
                <Guilds />
            </React.Suspense>
        </main>
    );
}

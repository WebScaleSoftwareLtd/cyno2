import { redirect } from "next/navigation";
import React from "react";
import { Guild } from "@/utils/getDiscordGuilds";
import Loading from "@/components/atoms/Loading";
import getGuild from "@/components/server/cached/getGuild";

type Props = {
    guildId: string;
    component: React.ComponentType<{ guild: Guild }>;
};

async function AsyncProvider({ guildId, component: Component }: Props) {
    // Get the guild.
    const guild = await getGuild(guildId);
    if (!guild) return redirect("/");

    // Return the layout which the configuration gets rendered into.
    return <Component guild={guild} />;
}

async function GuildProvider(props: Props) {
    return (
        <React.Suspense fallback={<Loading />}>
            <AsyncProvider {...props} />
        </React.Suspense>
    );
}

export default function withGuild(component: React.ComponentType<{ guild: Guild }>) {
    return async ({ params }: { params: { guildId: string } }) => {
        return <GuildProvider guildId={params.guildId} component={component} />;
    };
}

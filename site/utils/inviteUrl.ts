export default function inviteUrl(guildId?: string) {
    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.append("client_id", process.env.DISCORD_CLIENT_ID!);
    url.searchParams.append("permissions", "268700672");
    url.searchParams.append("scope", "bot");
    if (guildId) url.searchParams.append("guild_id", guildId);
    return url.toString();
}

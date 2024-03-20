import getDiscordUser from "@/utils/getDiscordUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Try to use the token to make sure it is dead.
    const user = await getDiscordUser();
    if (user) {
        return NextResponse.redirect("/dashboard");
    }

    // Generate a state if it doesn't exist.
    let state = req.cookies.get("state")?.value;
    if (!state) {
        state = Math.random().toString(36).substring(2);
    }

    // Generate the URL.
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
        throw new Error("DISCORD_CLIENT_ID is missing.");
    }
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("DISCORD_REDIRECT_URI is missing.");
    }
    const url = new URL("https://discord.com/api/oauth2/authorize");
    url.searchParams.append("client_id", clientId);
    url.searchParams.append("redirect_uri", redirectUri);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", "identify guilds");
    url.searchParams.append("state", state);

    // Redirect the user to Discord via HTML so the state is preserved.
    return new NextResponse(
        `<meta http-equiv="refresh" content="0; url=${url.href}">`,
        {
            status: 200,
            headers: {
                "Content-Type": "text/html",
                "Set-Cookie": `state=${state}; Path=/; HttpOnly; SameSite=Strict`,
            },
        }
    );
}

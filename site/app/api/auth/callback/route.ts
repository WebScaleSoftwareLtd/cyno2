import { setEncryptedCookie } from "@/cookiesafe";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Get the origin.
    const origin = req.headers.get("x-forwarded-host") || req.nextUrl.origin;

    // Check if the state is valid.
    if (
        cookies().get("state")?.value !== req.nextUrl.searchParams.get("state")
    ) {
        // Redirect the user to the homepage.
        return NextResponse.redirect(`${origin}/`);
    }

    // Make sure the code exists.
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
        // Show the user an error.
        return new NextResponse("Authentication failed: Code is missing.", {
            status: 400,
        });
    }

    // Exchange the code for a token.
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
        throw new Error("DISCORD_CLIENT_ID is missing.");
    }
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    if (!clientSecret) {
        throw new Error("DISCORD_CLIENT_SECRET is missing.");
    }
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("DISCORD_REDIRECT_URI is missing.");
    }
    const url = new URL("https://discord.com/api/v10/oauth2/token");
    const body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("code", code);
    body.append("redirect_uri", redirectUri);
    const response = await fetch(url.href, {
        method: "POST",
        body,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
    });
    if (!response.ok) {
        // Show the user an error.
        return new NextResponse(
            "Authentication failed: Token exchange failed.",
            { status: 400 },
        );
    }

    // Turn the response into a encrypted cookie.
    const responseJson = await response.json();
    const expires = Date.now() + responseJson.expires_in * 1000;
    const dataArray = [
        responseJson.access_token,
        responseJson.refresh_token,
        expires,
    ];
    const redirect = NextResponse.redirect(`${origin}/dashboard`);
    await setEncryptedCookie(
        "encrypted_token",
        JSON.stringify(dataArray),
        {
            path: "/",
            sameSite: "lax",
            expires,
        },
        redirect.cookies,
    );
    return redirect;
}

import { cookies } from "next/headers";
import encryptionVault from "./encryptionVault";

const sevenDays = 7 * 24 * 60 * 60 * 1000;

export default async function () {
    // Get the encrypted token from the cookies.
    const encryptedToken = cookies().get("encrypted_token");
    if (!encryptedToken) return null;

    // Decrypt the token.
    const vault = await encryptionVault;
    let token: [string, string, number];
    try {
        token = JSON.parse(vault.decrypt(encryptedToken.value).toString());
    } catch {
        return null;
    }

    // Check if the token is expired.
    if (Date.now() > token[2]) {
        // Try to renew the token.
        const refresh_token = token[1];
        if (
            !process.env.DISCORD_CLIENT_ID ||
            !process.env.DISCORD_CLIENT_SECRET
        ) {
            throw new Error(
                "DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET are missing.",
            );
        }
        const response = await fetch(
            "https://discord.com/api/v10/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token,
                }),
            },
        );
        if (!response.ok) return null;
        const j = await response.json();
        token = [
            j.access_token,
            j.refresh_token,
            Date.now() + j.expires_in * 1000,
        ];
        cookies().set(
            "encrypted_token",
            vault.encrypt(JSON.stringify(token)).toString(),
            {
                expires: Date.now() + sevenDays,
            },
        );
    }

    // Return the token.
    return token[0];
}

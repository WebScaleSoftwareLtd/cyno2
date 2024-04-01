import { getEncryptedCookie } from "@/cookiesafe";

export default async function () {
    // Get the encrypted token from the cookies.
    const encodedToken = await getEncryptedCookie("encrypted_token");
    if (!encodedToken) return null;

    // Decode the token.
    let token: [string, string, number] = JSON.parse(encodedToken);

    // Check if the token is expired.
    if (Date.now() > token[2]) return null;

    // Return the token.
    return token[0];
}

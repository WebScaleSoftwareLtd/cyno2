import { cookies } from "next/headers";
import { encrypt, decrypt, sign } from "./crypto";
import type { ResponseCookie, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

// Defines the promise to get the decryption key.
let decryptionKeyPromise = getKey();

// Cursed.
function someCursedShitToMakeWebpackIgnore(s: string) {
    return s;
}

// Gets the key. Always returns a successful promise, even in a error case.
async function getKey() {
    // Try to get from the environment.
    if (process.env.COOKIE_PRIVATE_KEY) return process.env.COOKIE_PRIVATE_KEY;

    // Try to get from the filesystem.
    let readFile;
    try {
        readFile = (await import(someCursedShitToMakeWebpackIgnore("fs/promises"))).readFile;
    } catch {
        return new Error(
            "Your current environment does not support fs/promises and no cookie variable was found."
        );
    }
    try {
        return (await readFile("private.key", { encoding: "utf-8" })).toString()
    } catch (err) {
        return err as Error;
    }
}

// Refreshes the key cache.
export async function refreshKeyCache() {
    const res = getKey();
    if (typeof (await res) === "string") {
        decryptionKeyPromise = res;
        return;
    }
    throw await res;
}

// Unwrap the decryption key promise.
async function unwrapKey() {
    const x = await decryptionKeyPromise;
    if (typeof x === "string") return x;
    throw x;
}

// Sets a new encrypted cookie.
export async function setEncryptedCookie(
    cookieName: string, value: string, cookie?: Partial<ResponseCookie>,
    jar?: ResponseCookies,
) {
    (jar || cookies()).set(
        cookieName, await encrypt(await unwrapKey(), value),
        cookie,
    );
}

// Gets a decrypted cookie.
export async function getEncryptedCookie(cookieName: string, jar?: ResponseCookies) {
    const key = await unwrapKey();
    const value = (jar || cookies()).get(cookieName);
    if (!value) return;
    try {
        return await decrypt(key, value.value);
    } catch {
        // Invalid cookie.
    }
}

// Sets a new signed cookie.
export async function setSignedCookie(
    cookieName: string, value: string, cookie?: Partial<ResponseCookie>,
    jar?: ResponseCookies,
) {
    (jar || cookies()).set(
        cookieName, await sign(await unwrapKey(), cookieName, value),
        cookie,
    );
}

// Gets a signed cookie.
export async function getSignedCookie(cookieName: string, jar?: ResponseCookies) {
    const key = await unwrapKey();
    const value = (jar || cookies()).get(cookieName);
    if (!value) return;

    const [_, data] = value.value.split(".", 2);
    if (typeof data !== "string") return;

    if (await sign(key, cookieName, data) === value.value) return data;
}

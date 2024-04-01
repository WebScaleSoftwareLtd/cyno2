import { toBase64, toBytes } from "fast-base64";

// Concat 2 uint8 arrays.
function concat(a: Uint8Array, b: Uint8Array) {
    const c = new Uint8Array(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
}

// Encrypt the cookie.
export async function encrypt(key: string, data: string) {
    // sha-256 the key so we get a 32 byte key.
    const keyBytes = new TextEncoder().encode(key);
    const keyHash = await crypto.subtle.digest("SHA-256", keyBytes);

    // Generate a random IV.
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Include the key hash so we can validate the key is right.
    const dataBytes = concat(
        new TextEncoder().encode(data),
        new Uint8Array(keyHash.slice(16)),
    );

    // Encrypt the data.
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        await crypto.subtle.importKey("raw", keyHash, "AES-GCM", true, [
            "encrypt",
        ]),
        dataBytes,
    );

    // Return the base64 encoded string of the IV and encrypted string.
    return toBase64(concat(iv, new Uint8Array(encrypted)));
}

// Compare 2 uint8 arrays.
function arrCmp(a: Uint8Array, b: Uint8Array) {
    if (globalThis.indexedDB) {
        return globalThis.indexedDB.cmp(a, b) === 0;
    }
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

// Decrypt the cookie.
export async function decrypt(key: string, data: string) {
    // sha-256 the key so we get a 32 byte key.
    const keyBytes = new TextEncoder().encode(key);
    const keyHash = await crypto.subtle.digest("SHA-256", keyBytes);

    // Base64 decode the data.
    const buffer = await toBytes(data);
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16);

    // Decrypt the data.
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        await crypto.subtle.importKey("raw", keyHash, "AES-GCM", true, [
            "decrypt",
        ]),
        encrypted,
    );

    // Validate the key hash.
    const decryptedBytes = new Uint8Array(decrypted);
    const keySlice = keyHash.slice(16);
    if (!arrCmp(new Uint8Array(keySlice), decryptedBytes.slice(-16))) {
        throw new Error("Invalid key");
    }

    // Return the decrypted data.
    return new TextDecoder().decode(decryptedBytes.slice(0, -16));
}

// Signs a cookie.
export async function sign(key: string, cookieName: string, data: string) {
    // Combine everything into a sha-256 hash.
    const keyBytes = new TextEncoder().encode(key + cookieName + data);
    const hash = await crypto.subtle.digest("SHA-256", keyBytes);

    // Return the hash base64 encoded plus a period and the data.
    return (await toBase64(new Uint8Array(hash))) + "." + data;
}

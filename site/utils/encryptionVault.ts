import { readFile } from "fs/promises";
import Neboris from "neboris";

export default (async () => {
    let privateKey = process.env.COOKIE_PRIVATE_KEY;
    if (!privateKey) {
        try {
            privateKey = await readFile("private.key", "utf8");
        } catch {
            throw new Error(
                "Both COOKIE_PRIVATE_KEY and private.key are missing.",
            );
        }
    }

    return new Neboris(privateKey);
})();

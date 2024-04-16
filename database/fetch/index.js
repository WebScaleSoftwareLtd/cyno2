import { fetch } from "@libsql/isomorphic-fetch";

const timeout = (t) => new Promise((resolve) => setTimeout(resolve, t));

export default async function (req) {
    for (;;) {
        try {
            return await fetch(req);
        } catch (err) {
            if ("message" in err && err.message.endsWith("socket hang up")) {
                console.error("fetch failed, retrying in 10ms");
                await timeout(10);
            }
        }
    }
}

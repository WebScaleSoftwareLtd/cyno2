import type { ResultSet } from "@libsql/client";
import type { RunResult } from "better-sqlite3";

// Patches the difference here between better-sqlite3 and libsql.
export default function rowsAffected(res: RunResult | ResultSet) {
    return "changes" in res ? res.changes : res.rowsAffected;
}

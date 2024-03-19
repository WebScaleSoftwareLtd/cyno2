import { SQLiteTable } from "drizzle-orm/sqlite-core";

export const takeableTables: SQLiteTable[] = [];

export function takeable<T extends SQLiteTable>(table: T) {
    takeableTables.push(table);
    return table;
}

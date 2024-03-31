import { client } from "database";
import * as schema from "database/schema";
import { cache } from "react";

export default cache(
    async <TableName extends keyof typeof schema>(
        tableName: TableName,
        guildId: string,
    ) => {
        return client.query[tableName].findFirst({
            // @ts-ignore: Eh, we should fail fast anyway if not.
            where: (row, { eq }) => eq(row.guildId, BigInt(guildId)),
        });
    },
);

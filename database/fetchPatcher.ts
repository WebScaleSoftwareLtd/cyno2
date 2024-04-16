import type {
    Client,
    InStatement,
    Transaction,
    TransactionMode,
} from "@libsql/client";

const timeout = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

async function backoff<T>(m: () => Promise<T>): Promise<T> {
    for (;;) {
        try {
            return await m();
        } catch (e) {
            if (
                // @ts-ignore: Errors are not typed.
                "message" in e &&
                // @ts-ignore: Errors are not typed.
                e.message.endsWith("reason: socket hang up")
            ) {
                console.warn("Socket hang up, retrying in 10ms...");
                await timeout(10);
            }
        }
    }
}

function txPatcher(tx: Transaction) {
    return new Proxy(tx, {
        get(target, prop, reciever) {
            switch (prop) {
                case "execute":
                    return async function execute(stmt: InStatement) {
                        return backoff(() => target.execute(stmt));
                    };
                case "batch":
                    return async function batch(stmts: Array<InStatement>) {
                        return backoff(() => target.batch(stmts));
                    };
                case "executeMultiple":
                    return async function executeMultiple(sql: string) {
                        return backoff(() => target.executeMultiple(sql));
                    };
                case "rollback":
                    return async function rollback() {
                        return backoff(() => target.rollback());
                    };
                case "commit":
                    return async function commit() {
                        return backoff(() => target.commit());
                    };
                default:
                    return Reflect.get(target, prop, reciever);
            }
        },
    });
}

export default function fetchPatcher(client: Client) {
    return new Proxy(client, {
        get(target, prop, reciever) {
            switch (prop) {
                case "execute":
                    return async function execute(stmt: InStatement) {
                        return backoff(() => target.execute(stmt));
                    };
                case "batch":
                    return async function batch(
                        stmts: Array<InStatement>,
                        mode?: TransactionMode,
                    ) {
                        return backoff(() => target.batch(stmts, mode));
                    };
                case "transaction":
                    return async function transaction(mode?: TransactionMode) {
                        return backoff(async () =>
                            txPatcher(await target.transaction(mode)),
                        );
                    };
                case "executeMultiple":
                    return async function executeMultiple(sql: string) {
                        return backoff(() => target.executeMultiple(sql));
                    };
                default:
                    return Reflect.get(target, prop, reciever);
            }
        },
    });
}

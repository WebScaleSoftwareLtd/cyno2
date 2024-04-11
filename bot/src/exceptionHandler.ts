import * as Sentry from "@sentry/node";

let unhandledDestructor: (() => void) | undefined;
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
} else {
    const cb = (e: any) => console.error(e);
    process.on("unhandledRejection", cb);
}

export { unhandledDestructor };

export function handleException(e: Error) {
    process.env.SENTRY_DSN ? Sentry.captureException(e) : console.error(e);
}

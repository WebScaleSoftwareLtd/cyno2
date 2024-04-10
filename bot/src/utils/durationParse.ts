const PRECOMPILED_YMDHMS = /\d+?([ymdhs])/gi;

export default function (time: string) {
    // Get the time in milliseconds.
    let timeInMs = 0;

    // Parse the time.
    let match: RegExpExecArray | null;
    while ((match = PRECOMPILED_YMDHMS.exec(time)) !== null) {
        const [full, unit] = match;
        const value = parseInt(full.slice(0, -1));
        switch (unit) {
            case "y":
                timeInMs += value * 365 * 24 * 60 * 60 * 1000;
                break;
            case "d":
                timeInMs += value * 24 * 60 * 60 * 1000;
                break;
            case "h":
                timeInMs += value * 60 * 60 * 1000;
                break;
            case "m":
                timeInMs += value * 60 * 1000;
                break;
            case "s":
                timeInMs += value * 1000;
                break;
        }
    }

    // Return the duration.
    return timeInMs;
}

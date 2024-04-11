import { getGuildIntervalsAndTimeouts } from "../scheduler";

export default async () => {
    // Get the sticky timeouts.
    await getGuildIntervalsAndTimeouts(null);

    // Log that we are connected.
    console.log("Bot connected to Discord!");
};

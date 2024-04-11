import { client, guildIntervals, guildTimeouts } from "database";
import { eq, isNull } from "drizzle-orm";
import ScheduledJob from "./ScheduledJob";
import { randomUUID } from "crypto";

import ChannelReminderJob from "./ChannelReminderJob";
import BirthdayPollJob from "./BirthdayPollJob";
import GuildDeleteJob from "./GuildDeleteJob";

// Defines all of the job types.
type JobConstructor<T> = new (data: T) => { toJson(): T; run(): Promise<void> };

// Defines the job types.
const jobTypes: { [key: string]: JobConstructor<any> } = {
    ChannelReminderJob,
    BirthdayPollJob,
    GuildDeleteJob,
} as const;

// Defines the mapping of guilds to timeouts.
const guildTimeoutsMapping: Map<
    bigint | null,
    {
        intervals: Map<string, any>;
        timeouts: Map<string, any>;
    }
> = new Map();

// Clears all timeouts for a guild.
function clearGuildTimeouts(guildId: bigint | null) {
    const g = guildTimeoutsMapping.get(guildId);
    guildTimeoutsMapping.delete(guildId);
    if (g) {
        g.intervals.forEach((interval) => clearInterval(interval));
        g.timeouts.forEach((timeout) => clearTimeout(timeout));
    }
}

// Gets the guilds intervals and timeouts.
export async function getGuildIntervalsAndTimeouts(guildId: bigint | null) {
    // Clear them locally if they already exist.
    clearGuildTimeouts(guildId);

    // Create the object for this guild.
    const guildMapping = {
        intervals: new Map<string, any>(),
        timeouts: new Map<string, any>(),
    };

    // Get the timeouts for the guild and set them up.
    const timeouts = await client.query.guildTimeouts.findMany({
        where: (guildTimeouts, { eq, isNull }) =>
            guildId
                ? eq(guildTimeouts.guildId, guildId)
                : isNull(guildTimeouts.guildId),
    });
    for (const timeout of timeouts) {
        // If the job type doesn't exist, skip it.
        const JobClass = jobTypes[timeout.jobType];
        if (!JobClass) continue;

        // Create the instance.
        const job = new JobClass(timeout.json);

        // Get the amount of time in milliseconds since the timeout in the job.
        let time = timeout.timeout.getTime() - Date.now();
        if (time < 0) time = 0;

        // Create the timeout with the runner.
        const runner = async () => {
            try {
                // Run the job.
                await job.run();

                // Delete the timeout.
                await client
                    .delete(guildTimeouts)
                    .where(eq(guildTimeouts.jobId, timeout.jobId))
                    .execute();

                // Delete from the mapping.
                const mapping = guildTimeoutsMapping.get(guildId);
                if (mapping) {
                    mapping.timeouts.delete(timeout.jobId);
                }
            } catch (err) {
                // Log the error with 'Timeout job failed: '.
                console.error("Timeout job failed: ", err);

                // Check if the guild is still in the map.
                const mapping = guildTimeoutsMapping.get(guildId);
                if (mapping) {
                    // Create a new timeout for 2 minutes from now.
                    const newTimeout = setTimeout(runner, 2 * 60 * 1000);

                    // Set the new timeout in the mapping.
                    mapping.timeouts.set(timeout.jobId, newTimeout);
                }
            }
        };
        const timeoutId = setTimeout(runner, time);

        // Set the timeout in the mapping.
        guildMapping.timeouts.set(timeout.jobId, timeoutId);
    }

    // Get the intervals for the guild and set them up.
    const intervals = await client.query.guildIntervals.findMany({
        where: (guildIntervals, { eq, isNull }) =>
            guildId
                ? eq(guildIntervals.guildId, guildId)
                : isNull(guildIntervals.guildId),
    });
    for (const interval of intervals) {
        // If the job type doesn't exist, skip it.
        const JobClass = jobTypes[interval.jobType];
        if (!JobClass) continue;

        // Create the instance.
        const job = new JobClass(interval.json);

        // Create the interval with the runner.
        const runner = async () => {
            try {
                // Run the job.
                await job.run();
            } catch (err) {
                // Log the error with 'Interval job failed: '.
                console.error("Interval job failed: ", err);
            }
        };
        const intervalId = setInterval(runner, interval.interval);

        // Set the interval in the mapping.
        guildMapping.intervals.set(interval.jobId, intervalId);
    }

    // Set the mapping in the guildTimeoutsMapping.
    guildTimeoutsMapping.set(guildId, guildMapping);
}

function getJobType<T extends ScheduledJob<any>>(job: T) {
    for (const [name, JobClass] of Object.entries(jobTypes)) {
        if (job instanceof JobClass) return name;
    }
    throw new Error("Job type not found.");
}

// Create a timeout for a specific job. Guild ID being null makes it a sticky job.
export async function createTimeout<T extends ScheduledJob<any>>(
    guildId: bigint | null,
    job: T,
    timeout: Date,
) {
    // Start by inserting the timeout into the database.
    const jobId = randomUUID();
    await client
        .insert(guildTimeouts)
        .values({
            guildId,
            jobId,
            jobType: getJobType(job),
            timeout,
            json: job.toJson(),
        })
        .execute();

    // Check if the guild is in the mapping.
    const mapping = guildTimeoutsMapping.get(guildId);
    if (mapping) {
        // Get the amount of time in milliseconds since the timeout.
        let time = timeout.getTime() - Date.now();
        if (time < 0) time = 0;

        // Create the timeout with the runner.
        const runner = async () => {
            try {
                // Run the job.
                await job.run();

                // Delete the timeout.
                await client
                    .delete(guildTimeouts)
                    .where(eq(guildTimeouts.jobId, jobId))
                    .execute();

                // Delete from the mapping.
                const mapping = guildTimeoutsMapping.get(guildId);
                if (mapping) {
                    mapping.timeouts.delete(jobId);
                }
            } catch (err) {
                // Log the error with 'Timeout job failed: '.
                console.error("Timeout job failed: ", err);

                // Check if the guild is still in the map.
                const mapping = guildTimeoutsMapping.get(guildId);
                if (mapping) {
                    // Create a new timeout for 2 minutes from now.
                    const newTimeout = setTimeout(runner, 2 * 60 * 1000);

                    // Set the new timeout in the mapping.
                    mapping.timeouts.set(jobId, newTimeout);
                }
            }
        };
        const timeoutId = setTimeout(runner, time);

        // Set the timeout in the mapping.
        mapping.timeouts.set(jobId, timeoutId);
    } else {
        // Get the guilds intervals and timeouts.
        await getGuildIntervalsAndTimeouts(guildId);
    }

    // Return the job id.
    return jobId;
}

// Create a interval for a specific job.
export async function createInterval<T extends ScheduledJob<any>>(
    guildId: bigint,
    job: T,
    interval: number,
) {
    // Start by inserting the interval into the database.
    const jobId = randomUUID();
    await client
        .insert(guildIntervals)
        .values({
            guildId,
            jobId,
            jobType: getJobType(job),
            interval,
            json: job.toJson(),
        })
        .execute();

    // Check if the guild is in the mapping.
    const mapping = guildTimeoutsMapping.get(guildId);
    if (mapping) {
        // Create the interval with the runner.
        const runner = async () => {
            try {
                // Run the job.
                await job.run();
            } catch (err) {
                // Log the error with 'Interval job failed: '.
                console.error("Interval job failed: ", err);
            }
        };
        const intervalId = setInterval(runner, interval);

        // Set the interval in the mapping.
        mapping.intervals.set(jobId, intervalId);
    } else {
        // Get the guilds intervals and timeouts.
        await getGuildIntervalsAndTimeouts(guildId);
    }
}

// Wipe all timeouts and intervals for a guild.
export async function wipeGuildIntervalsAndTimeouts(guildId: bigint) {
    // Clear them locally.
    clearGuildTimeouts(guildId);

    // Delete them from the database.
    await client
        .delete(guildIntervals)
        .where(eq(guildIntervals.guildId, guildId))
        .execute();
    await client
        .delete(guildTimeouts)
        .where(eq(guildTimeouts.guildId, guildId))
        .execute();
}

// Check if a interval job type exists.
export async function intervalJobTypeExists(guildId: bigint, jobType: string) {
    const val = await client.query.guildIntervals.findFirst({
        where: (guildIntervals, { and, eq }) =>
            and(
                eq(guildIntervals.guildId, guildId),
                eq(guildIntervals.jobType, jobType),
            ),
    });
    return !!val;
}

// Deletes a job from the database and the mapping.
export async function deleteTimeout(guildId: bigint | null, jobId: string) {
    // Delete the timeout from the database.
    await client
        .delete(guildTimeouts)
        .where(
            eq(
                eq(guildTimeouts.jobId, jobId),
                guildId
                    ? eq(guildTimeouts.guildId, guildId)
                    : isNull(guildTimeouts.guildId),
            ),
        )
        .execute();

    // Check if the guild is in the mapping.
    const mapping = guildTimeoutsMapping.get(guildId);
    if (mapping) {
        // Clear the timeout from the mapping.
        const timeout = mapping.timeouts.get(jobId);
        if (timeout) {
            clearTimeout(timeout);
            mapping.timeouts.delete(jobId);
        }
    }
}

import ScheduledJob from "./ScheduledJob";
import { globalState } from "../state";

type ChannelReminderJobData = {
    channelId: string;
    userId: string;
    message: string;
};

export default class ChannelReminderJob
    implements ScheduledJob<ChannelReminderJobData>
{
    constructor(private data: ChannelReminderJobData) {}

    toJson() {
        return this.data;
    }

    async run() {
        try {
            await globalState
                .client!.channels.fetch(this.data.channelId)
                .then(async (channel) => {
                    if (!channel?.isTextBased()) return;
                    await channel.send(
                        `${this.data.message} (notification scheduled by <@${this.data.userId}>)`,
                    );
                });
        } catch {
            // If the channel doesn't exist or the message fails, do nothing.
        }
    }
}

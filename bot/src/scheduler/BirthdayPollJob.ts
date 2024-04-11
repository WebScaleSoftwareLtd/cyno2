import ScheduledJob from "./ScheduledJob";

export default class BirthdayPollJob implements ScheduledJob<string> {
    constructor(private guildId: string) {}

    toJson() {
        return this.guildId;
    }

    async run() {
        // TODO
    }
}

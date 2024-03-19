import ScheduledJob from "./ScheduledJob";

export default class BirthdayPollJob extends ScheduledJob<string> {
    constructor(private guildId: string) {
        super();
    }

    toJson() {
        return this.guildId;
    }

    async run() {
        // TODO
    }
}

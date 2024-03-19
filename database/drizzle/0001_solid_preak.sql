CREATE TABLE `guild_intervals` (
	`job_id` text PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	`interval` integer NOT NULL,
	`job_type` text NOT NULL,
	`json` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guild_timeouts` (
	`job_id` text PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	`timeout` integer NOT NULL,
	`job_type` text NOT NULL,
	`json` blob NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guild_intervals_guild_id_idx` ON `guild_intervals` (`guild_id`);--> statement-breakpoint
CREATE INDEX `guild_intervals_job_type_idx` ON `guild_intervals` (`guild_id`,`job_type`);--> statement-breakpoint
CREATE INDEX `guild_timeouts_guild_id_idx` ON `guild_timeouts` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `adc_guild_channel_idx` ON `allowed_drop_channels` (`guild_id`,`channel_id`);--> statement-breakpoint
ALTER TABLE `guilds` DROP COLUMN `drops_calculation`;
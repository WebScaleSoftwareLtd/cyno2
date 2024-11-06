DROP TABLE `birthdays`;--> statement-breakpoint
DROP INDEX IF EXISTS `drop_guild_isd_idx`;--> statement-breakpoint
CREATE INDEX `drop_guild_id_idx` ON `currency_drop` (`guild_id`);
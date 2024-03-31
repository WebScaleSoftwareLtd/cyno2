DROP INDEX IF EXISTS `lr_guild_role_level_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `lr_guild_role_idx` ON `level_roles` (`role_id`);--> statement-breakpoint
ALTER TABLE `level_roles` DROP COLUMN `user_id`;
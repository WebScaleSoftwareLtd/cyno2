CREATE TABLE `allowed_drop_channels` (
	`channel_id` blob PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	`last_drop` integer,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `birthdays` (
	`user_id` blob PRIMARY KEY NOT NULL,
	`day` integer NOT NULL,
	`month` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `currency_drop` (
	`message_id` blob PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `dashboard_admins` (
	`guild_id` blob,
	`user_id` blob,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `experience_points` (
	`guild_id` blob NOT NULL,
	`user_id` blob NOT NULL,
	`xp` integer NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`last_xp` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `guild_birthday_config` (
	`guild_id` blob PRIMARY KEY NOT NULL,
	`role_id` blob,
	`currency` integer DEFAULT 0 NOT NULL,
	`channel_id` blob,
	`birthday_message` text DEFAULT '{user} is 1 year older today! Wish them a happy birthday!' NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `guild_intervals` (
	`job_id` text PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	`interval` integer NOT NULL,
	`job_type` text NOT NULL,
	`json` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guild_timely_config` (
	`guild_id` blob PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`amount` integer DEFAULT 10 NOT NULL,
	`hours_between_collections` integer DEFAULT 24 NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
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
CREATE TABLE `guilds` (
	`guild_id` blob PRIMARY KEY NOT NULL,
	`drops_enabled` integer DEFAULT true NOT NULL,
	`currency_emoji` text DEFAULT '💰' NOT NULL,
	`drop_amount_min` integer DEFAULT 75 NOT NULL,
	`drop_amount_max` integer DEFAULT 100 NOT NULL,
	`drop_image` text DEFAULT 'https://i.imgur.com/dFpT1Zy.jpg' NOT NULL,
	`xp_enabled` integer DEFAULT true NOT NULL,
	`level_multiplier` integer DEFAULT 10 NOT NULL,
	`drop_message` text DEFAULT '{emoji} {amount} has dropped into this channel!' NOT NULL,
	`level_up_message` text DEFAULT 'Congratulations {user}, you have leveled up to level {level}!' NOT NULL,
	`level_up_dm` integer DEFAULT false NOT NULL,
	`drop_blanks` integer DEFAULT 0 NOT NULL,
	`drop_seconds_cooldown` integer DEFAULT 5,
	`destroy_at` integer
);
--> statement-breakpoint
CREATE TABLE `last_guild_takeout` (
	`guild_id` blob PRIMARY KEY NOT NULL,
	`last_takeout` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `level_blacklisted_channels` (
	`channel_id` blob PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `level_roles` (
	`role_id` blob NOT NULL,
	`guild_id` blob NOT NULL,
	`level` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_shop` (
	`role_id` blob PRIMARY KEY NOT NULL,
	`guild_id` blob NOT NULL,
	`price` integer NOT NULL,
	`revised` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shares` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`guild_id` blob NOT NULL,
	`user_id` blob NOT NULL,
	`invested` integer NOT NULL,
	`stock_name` text NOT NULL,
	`share_count` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `time_locations` (
	`user_id` blob PRIMARY KEY NOT NULL,
	`location` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timely_collections` (
	`user_id` blob NOT NULL,
	`guild_id` blob NOT NULL,
	`last_collected` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`created_at` integer NOT NULL,
	`guild_id` blob NOT NULL,
	`user_id` blob NOT NULL,
	`amount` blob NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wallet` (
	`user_id` blob NOT NULL,
	`guild_id` blob NOT NULL,
	`balance` blob NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `adc_guild_id_idx` ON `allowed_drop_channels` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `adc_guild_channel_idx` ON `allowed_drop_channels` (`guild_id`,`channel_id`);--> statement-breakpoint
CREATE INDEX `drop_guild_id_idx` ON `currency_drop` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `admins_guild_member_idx` ON `dashboard_admins` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `xp_guild_id_idx` ON `experience_points` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `xp_guild_member_idx` ON `experience_points` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `xp_guild_total_xp_idx` ON `experience_points` (`guild_id`,`total_xp`);--> statement-breakpoint
CREATE INDEX `guild_intervals_guild_id_idx` ON `guild_intervals` (`guild_id`);--> statement-breakpoint
CREATE INDEX `guild_intervals_job_type_idx` ON `guild_intervals` (`guild_id`,`job_type`);--> statement-breakpoint
CREATE INDEX `guild_timeouts_guild_id_idx` ON `guild_timeouts` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `guilds_destroy_at_idx` ON `guilds` (`destroy_at`);--> statement-breakpoint
CREATE INDEX `lbc_guild_id_idx` ON `level_blacklisted_channels` (`guild_id`);--> statement-breakpoint
CREATE INDEX `lr_guild_id_idx` ON `level_roles` (`guild_id`);--> statement-breakpoint
CREATE INDEX `lr_guild_level_idx` ON `level_roles` (`guild_id`,`level`);--> statement-breakpoint
CREATE UNIQUE INDEX `lr_guild_role_idx` ON `level_roles` (`role_id`);--> statement-breakpoint
CREATE INDEX `role_shop_guild_id_idx` ON `role_shop` (`guild_id`);--> statement-breakpoint
CREATE INDEX `shares_guild_id_idx` ON `shares` (`guild_id`);--> statement-breakpoint
CREATE INDEX `shares_member_idx` ON `shares` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `shares_created_at_idx` ON `shares` (`guild_id`,`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `timely_guild_id_idx` ON `timely_collections` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `timely_guild_member_idx` ON `timely_collections` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `tx_guild_id_idx` ON `transactions` (`guild_id`);--> statement-breakpoint
CREATE INDEX `tx_member_idx` ON `transactions` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `tx_created_at_idx` ON `transactions` (`guild_id`,`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `wallet_guild_id_idx` ON `wallet` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_guild_member_idx` ON `wallet` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `wallet_guild_balance_idx` ON `wallet` (`guild_id`,`balance`);
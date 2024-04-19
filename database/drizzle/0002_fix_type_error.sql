-- Make a new transactions table.
CREATE TABLE `transactions_new` (
	`created_at` integer NOT NULL,
	`guild_id` blob NOT NULL,
	`user_id` blob NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Rename the old transactions table to transactions_old so that we fail rather than lose data.
ALTER TABLE `transactions` RENAME TO `transactions_old`;--> statement-breakpoint

-- Copy all of the data from the old transactions table to the new transactions table but convert the amount to a number.
INSERT INTO `transactions_new` (`created_at`, `guild_id`, `user_id`, `amount`, `reason`) SELECT `created_at`, `guild_id`, `user_id`, CAST(`amount` AS integer), `reason` FROM `transactions_old`;--> statement-breakpoint

-- Drop the old transactions table.
DROP TABLE `transactions_old`;--> statement-breakpoint

-- Rename the new transactions table to transactions.
ALTER TABLE `transactions_new` RENAME TO `transactions`;--> statement-breakpoint

-- Recreate the indexes.
CREATE INDEX `tx_guild_id_idx` ON `transactions` (`guild_id`);--> statement-breakpoint
CREATE INDEX `tx_member_idx` ON `transactions` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `tx_created_at_idx` ON `transactions` (`guild_id`,`user_id`,`created_at`);

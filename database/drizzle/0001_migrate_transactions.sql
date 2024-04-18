-- Make a new wallets table.
CREATE TABLE `wallet_new` (
	`user_id` blob NOT NULL,
	`guild_id` blob NOT NULL,
	`balance` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Rename the old wallet table to wallet_old so that we fail rather than lose data.
ALTER TABLE `wallet` RENAME TO `wallet_old`;--> statement-breakpoint

-- Copy all of the data from the old wallet table to the new wallet table but convert the balance to an integer.
INSERT INTO `wallet_new` (`user_id`, `guild_id`, `balance`) SELECT `user_id`, `guild_id`, CAST(`balance` AS integer) FROM `wallet_old`;--> statement-breakpoint

-- Drop the old wallet table.
DROP TABLE `wallet_old`;--> statement-breakpoint

-- Rename the new wallet table to wallet.
ALTER TABLE `wallet_new` RENAME TO `wallet`;--> statement-breakpoint

-- Recreate the indexes.
CREATE INDEX `wallet_guild_id_idx` ON `wallet` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_guild_member_idx` ON `wallet` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `wallet_guild_balance_idx` ON `wallet` (`guild_id`,`balance`);--> statement-breakpoint

-- Make a new transactions table.
CREATE TABLE `transactions_new` (
	`created_at` integer NOT NULL,
	`guild_id` blob NOT NULL,
	`user_id` blob NOT NULL,
	`amount` number NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Rename the old transactions table to transactions_old so that we fail rather than lose data.
ALTER TABLE `transactions` RENAME TO `transactions_old`;--> statement-breakpoint

-- Copy all of the data from the old transactions table to the new transactions table but convert the amount to a number.
INSERT INTO `transactions_new` (`created_at`, `guild_id`, `user_id`, `amount`, `reason`) SELECT `created_at`, `guild_id`, `user_id`, CAST(`amount` AS number), `reason` FROM `transactions_old`;--> statement-breakpoint

-- Drop the old transactions table.
DROP TABLE `transactions_old`;--> statement-breakpoint

-- Rename the new transactions table to transactions.
ALTER TABLE `transactions_new` RENAME TO `transactions`;--> statement-breakpoint

-- Recreate the indexes.
CREATE INDEX `tx_guild_id_idx` ON `transactions` (`guild_id`);--> statement-breakpoint
CREATE INDEX `tx_member_idx` ON `transactions` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `tx_created_at_idx` ON `transactions` (`guild_id`,`user_id`,`created_at`);

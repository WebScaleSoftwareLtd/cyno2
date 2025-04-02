CREATE TABLE "allowed_drop_channels" (
	"channel_id" bigint PRIMARY KEY NOT NULL,
	"guild_id" bigint NOT NULL,
	"last_drop" timestamp
);
--> statement-breakpoint
CREATE TABLE "currency_drop" (
	"message_id" bigint PRIMARY KEY NOT NULL,
	"guild_id" bigint NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_admins" (
	"guild_id" bigint,
	"user_id" bigint
);
--> statement-breakpoint
CREATE TABLE "experience_points" (
	"guild_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"xp" integer NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"last_xp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_birthday_config" (
	"guild_id" bigint PRIMARY KEY NOT NULL,
	"role_id" bigint,
	"currency" integer DEFAULT 0 NOT NULL,
	"channel_id" bigint,
	"birthday_message" text DEFAULT '{user} is 1 year older today! Wish them a happy birthday!' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_intervals" (
	"job_id" text PRIMARY KEY NOT NULL,
	"guild_id" bigint NOT NULL,
	"interval" integer NOT NULL,
	"job_type" text NOT NULL,
	"json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_timely_config" (
	"guild_id" bigint PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"amount" integer DEFAULT 10 NOT NULL,
	"hours_between_collections" integer DEFAULT 24 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_timeouts" (
	"job_id" text PRIMARY KEY NOT NULL,
	"guild_id" bigint,
	"timeout" timestamp NOT NULL,
	"job_type" text NOT NULL,
	"json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"guild_id" bigint PRIMARY KEY NOT NULL,
	"drops_enabled" boolean DEFAULT true NOT NULL,
	"currency_emoji" text DEFAULT '💰' NOT NULL,
	"drop_amount_min" integer DEFAULT 75 NOT NULL,
	"drop_amount_max" integer DEFAULT 100 NOT NULL,
	"drop_image" text DEFAULT 'https://i.imgur.com/dFpT1Zy.jpg' NOT NULL,
	"xp_enabled" boolean DEFAULT true NOT NULL,
	"level_multiplier" integer DEFAULT 10 NOT NULL,
	"drop_message" text DEFAULT '{emoji} {amount} has dropped into this channel!' NOT NULL,
	"level_up_message" text DEFAULT 'Congratulations {user}, you have leveled up to level {level}!' NOT NULL,
	"level_up_dm" boolean DEFAULT false NOT NULL,
	"drop_blanks" integer DEFAULT 0 NOT NULL,
	"drop_seconds_cooldown" integer DEFAULT 5,
	"destroy_at" timestamp,
	"destroy_job_id" text
);
--> statement-breakpoint
CREATE TABLE "last_guild_takeout" (
	"guild_id" bigint PRIMARY KEY NOT NULL,
	"last_takeout" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_blacklisted_channels" (
	"channel_id" bigint PRIMARY KEY NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_roles" (
	"role_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"level" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_shop" (
	"role_id" bigint PRIMARY KEY NOT NULL,
	"guild_id" bigint NOT NULL,
	"price" integer NOT NULL,
	"revised" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"guild_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"invested" integer NOT NULL,
	"stock_name" text NOT NULL,
	"share_count" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_locations" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"location" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timely_collections" (
	"user_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"last_collected" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"created_at" timestamp NOT NULL,
	"guild_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"user_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"balance" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "allowed_drop_channels" ADD CONSTRAINT "allowed_drop_channels_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "currency_drop" ADD CONSTRAINT "currency_drop_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_admins" ADD CONSTRAINT "dashboard_admins_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_points" ADD CONSTRAINT "experience_points_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guild_birthday_config" ADD CONSTRAINT "guild_birthday_config_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guild_timely_config" ADD CONSTRAINT "guild_timely_config_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "last_guild_takeout" ADD CONSTRAINT "last_guild_takeout_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_blacklisted_channels" ADD CONSTRAINT "level_blacklisted_channels_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_shop" ADD CONSTRAINT "role_shop_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timely_collections" ADD CONSTRAINT "timely_collections_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_guild_id_guilds_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adc_guild_id_idx" ON "allowed_drop_channels" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "adc_guild_channel_idx" ON "allowed_drop_channels" USING btree ("guild_id","channel_id");--> statement-breakpoint
CREATE INDEX "drop_guild_id_idx" ON "currency_drop" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admins_guild_member_idx" ON "dashboard_admins" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "xp_guild_id_idx" ON "experience_points" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "xp_guild_member_idx" ON "experience_points" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "xp_guild_total_xp_idx" ON "experience_points" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "guild_intervals_guild_id_idx" ON "guild_intervals" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "guild_intervals_job_type_idx" ON "guild_intervals" USING btree ("guild_id","job_type");--> statement-breakpoint
CREATE INDEX "guild_timeouts_guild_id_idx" ON "guild_timeouts" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guilds_destroy_at_idx" ON "guilds" USING btree ("destroy_at");--> statement-breakpoint
CREATE INDEX "lbc_guild_id_idx" ON "level_blacklisted_channels" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "lr_guild_id_idx" ON "level_roles" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "lr_guild_level_idx" ON "level_roles" USING btree ("guild_id","level");--> statement-breakpoint
CREATE UNIQUE INDEX "lr_guild_role_idx" ON "level_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_shop_guild_id_idx" ON "role_shop" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "shares_guild_id_idx" ON "shares" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "shares_member_idx" ON "shares" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "shares_created_at_idx" ON "shares" USING btree ("guild_id","user_id","created_at");--> statement-breakpoint
CREATE INDEX "timely_guild_id_idx" ON "timely_collections" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "timely_guild_member_idx" ON "timely_collections" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "tx_guild_id_idx" ON "transactions" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "tx_member_idx" ON "transactions" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "tx_created_at_idx" ON "transactions" USING btree ("guild_id","user_id","created_at");--> statement-breakpoint
CREATE INDEX "wallet_guild_id_idx" ON "wallet" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_guild_member_idx" ON "wallet" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "wallet_guild_balance_idx" ON "wallet" USING btree ("guild_id","balance");
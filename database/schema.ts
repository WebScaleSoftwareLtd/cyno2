import {
    bigint,
    text,
    integer,
    pgTable,
    uniqueIndex,
    index,
    real,
    boolean,
    timestamp,
    serial,
    jsonb,
} from "drizzle-orm/pg-core";
import { takeable } from "./takeout/takeable";

export const guilds = takeable(
    pgTable(
        "guilds",
        {
            guildId: bigint("guild_id", { mode: "bigint" }).primaryKey(),
            dropsEnabled: boolean("drops_enabled").notNull().default(true),
            currencyEmoji: text("currency_emoji").notNull().default("💰"),
            dropAmountMin: integer("drop_amount_min").default(75).notNull(),
            dropAmountMax: integer("drop_amount_max").default(100).notNull(),
            dropImage: text("drop_image")
                .default("https://i.imgur.com/dFpT1Zy.jpg")
                .notNull(),
            xpEnabled: boolean("xp_enabled").default(true).notNull(),
            levelMultiplier: integer("level_multiplier").default(10).notNull(),
            dropMessage: text("drop_message")
                .default("{emoji} {amount} has dropped into this channel!")
                .notNull(),
            levelUpMessage: text("level_up_message")
                .default(
                    "Congratulations {user}, you have leveled up to level {level}!",
                )
                .notNull(),
            levelUpDM: boolean("level_up_dm").default(false).notNull(),
            dropBlanks: integer("drop_blanks").default(0).notNull(),
            dropSecondsCooldown: integer("drop_seconds_cooldown").default(5),
            destroyAt: timestamp("destroy_at"),
            destroyJobId: text("destroy_job_id"),
        },
        (table) => [uniqueIndex("guilds_destroy_at_idx").on(table.destroyAt)],
    ),
);

export const allowedDropChannels = takeable(
    pgTable(
        "allowed_drop_channels",
        {
            channelId: bigint("channel_id", { mode: "bigint" }).primaryKey(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            lastDrop: timestamp("last_drop"),
        },
        (table) => [
            index("adc_guild_id_idx").on(table.guildId),
            uniqueIndex("adc_guild_channel_idx").on(
                table.guildId,
                table.channelId,
            ),
        ],
    ),
);

export const lastGuildTakeout = pgTable("last_guild_takeout", {
    guildId: bigint("guild_id", { mode: "bigint" })
        .primaryKey()
        .references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
    lastTakeout: timestamp("last_takeout").notNull(),
});

export const levelBlacklistedChannels = takeable(
    pgTable(
        "level_blacklisted_channels",
        {
            channelId: bigint("channel_id", { mode: "bigint" }).primaryKey(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
        },
        (table) => [index("lbc_guild_id_idx").on(table.guildId)],
    ),
);

export const experiencePoints = takeable(
    pgTable(
        "experience_points",
        {
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            userId: bigint("user_id", { mode: "bigint" }).notNull(),
            xp: integer("xp").notNull(),
            totalXp: integer("total_xp").default(0).notNull(),
            level: integer("level").default(1).notNull(),
            lastXp: timestamp("last_xp").notNull(),
        },
        (table) => [
            index("xp_guild_id_idx").on(table.guildId),
            uniqueIndex("xp_guild_member_idx").on(table.guildId, table.userId),
            index("xp_guild_total_xp_idx").on(table.guildId),
        ],
    ),
);

export const currencyDrop = takeable(
    pgTable(
        "currency_drop",
        {
            messageId: bigint("message_id", { mode: "bigint" }).primaryKey(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            amount: integer("amount").notNull(),
        },
        (table) => [index("drop_guild_id_idx").on(table.guildId)],
    ),
);

export const wallet = takeable(
    pgTable(
        "wallet",
        {
            userId: bigint("user_id", { mode: "bigint" }).notNull(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            balance: integer("balance").notNull(),
        },
        (table) => [
            index("wallet_guild_id_idx").on(table.guildId),
            uniqueIndex("wallet_guild_member_idx").on(
                table.guildId,
                table.userId,
            ),
            index("wallet_guild_balance_idx").on(table.guildId, table.balance),
        ],
    ),
);

export const levelRoles = takeable(
    pgTable(
        "level_roles",
        {
            roleId: bigint("role_id", { mode: "bigint" }).notNull(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            level: integer("level").notNull(),
        },
        (table) => [
            index("lr_guild_id_idx").on(table.guildId),
            index("lr_guild_level_idx").on(table.guildId, table.level),
            uniqueIndex("lr_guild_role_idx").on(table.roleId),
        ],
    ),
);

export const transactions = takeable(
    pgTable(
        "transactions",
        {
            createdAt: timestamp("created_at").notNull(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            userId: bigint("user_id", { mode: "bigint" }).notNull(),
            amount: integer("amount").notNull(),
            reason: text("reason").notNull(),
        },
        (table) => [
            index("tx_guild_id_idx").on(table.guildId),
            index("tx_member_idx").on(table.guildId, table.userId),
            index("tx_created_at_idx").on(
                table.guildId,
                table.userId,
                table.createdAt,
            ),
        ],
    ),
);

export const shares = takeable(
    pgTable(
        "shares",
        {
            id: serial("id").primaryKey(),
            createdAt: timestamp("created_at").notNull(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            userId: bigint("user_id", { mode: "bigint" }).notNull(),
            invested: integer("invested").notNull(),
            stockName: text("stock_name").notNull(),
            shareCount: real("share_count").notNull(),
        },
        (table) => [
            index("shares_guild_id_idx").on(table.guildId),
            index("shares_member_idx").on(table.guildId, table.userId),
            index("shares_created_at_idx").on(
                table.guildId,
                table.userId,
                table.createdAt,
            ),
        ],
    ),
);

export const roleShop = takeable(
    pgTable(
        "role_shop",
        {
            roleId: bigint("role_id", { mode: "bigint" }).primaryKey(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            price: integer("price").notNull(),
            revised: boolean("revised").default(false).notNull(),
        },
        (table) => [index("role_shop_guild_id_idx").on(table.guildId)],
    ),
);

export const timelyCollections = takeable(
    pgTable(
        "timely_collections",
        {
            userId: bigint("user_id", { mode: "bigint" }).notNull(),
            guildId: bigint("guild_id", { mode: "bigint" })
                .notNull()
                .references(() => guilds.guildId, {
                    onDelete: "cascade",
                }),
            lastCollected: timestamp("last_collected").notNull(),
        },
        (table) => [
            index("timely_guild_id_idx").on(table.guildId),
            uniqueIndex("timely_guild_member_idx").on(
                table.guildId,
                table.userId,
            ),
        ],
    ),
);

export const guildTimelyConfig = takeable(
    pgTable("guild_timely_config", {
        guildId: bigint("guild_id", { mode: "bigint" })
            .primaryKey()
            .references(() => guilds.guildId, {
                onDelete: "cascade",
            }),
        enabled: boolean("enabled").default(false).notNull(),
        amount: integer("amount").notNull().default(10),
        hoursBetweenCollections: integer("hours_between_collections")
            .notNull()
            .default(24),
    }),
);

export const dashboardAdmins = takeable(
    pgTable(
        "dashboard_admins",
        {
            guildId: bigint("guild_id", { mode: "bigint" }).references(
                () => guilds.guildId,
                {
                    onDelete: "cascade",
                },
            ),
            userId: bigint("user_id", { mode: "bigint" }),
        },
        (table) => [
            uniqueIndex("admins_guild_member_idx").on(
                table.guildId,
                table.userId,
            ),
        ],
    ),
);

export const timeLocation = pgTable("time_locations", {
    userId: bigint("user_id", { mode: "bigint" }).notNull().primaryKey(),
    location: text("location").notNull(),
});

export const guildBirthdayConfig = takeable(
    pgTable("guild_birthday_config", {
        guildId: bigint("guild_id", { mode: "bigint" })
            .primaryKey()
            .references(() => guilds.guildId, {
                onDelete: "cascade",
            }),
        roleId: bigint("role_id", { mode: "bigint" }),
        currency: integer("currency").notNull().default(0),
        channelId: bigint("channel_id", { mode: "bigint" }),
        birthdayMessage: text("birthday_message")
            .notNull()
            .default(
                "{user} is 1 year older today! Wish them a happy birthday!",
            ),
    }),
);

export const guildTimeouts = takeable(
    pgTable(
        "guild_timeouts",
        {
            jobId: text("job_id").primaryKey(),
            guildId: bigint("guild_id", { mode: "bigint" }),
            timeout: timestamp("timeout").notNull(),
            jobType: text("job_type").notNull(),
            json: jsonb("json").notNull(),
        },
        (table) => [index("guild_timeouts_guild_id_idx").on(table.guildId)],
    ),
);

export const guildIntervals = takeable(
    pgTable(
        "guild_intervals",
        {
            jobId: text("job_id").primaryKey(),
            guildId: bigint("guild_id", { mode: "bigint" }).notNull(),
            interval: integer("interval").notNull(),
            jobType: text("job_type").notNull(),
            json: jsonb("json").notNull(),
        },
        (table) => [
            index("guild_intervals_guild_id_idx").on(table.guildId),
            index("guild_intervals_job_type_idx").on(
                table.guildId,
                table.jobType,
            ),
        ],
    ),
);

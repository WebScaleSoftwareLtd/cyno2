import { blob, text, integer, sqliteTable, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { takeable } from "./takeout/takeable";

export const guilds = takeable(
    sqliteTable("guilds", {
        guildId: blob("guild_id", { mode: "bigint" }).primaryKey(),
        dropsEnabled: integer("drops_enabled", { mode: "boolean" }).notNull().default(true),
        currencyEmoji: text("currency_emoji").notNull().default("💰"),
        dropAmountMin: integer("drop_amount_min", {mode: "number"}).default(75).notNull(),
        dropAmountMax: integer("drop_amount_max", {mode: "number"}).default(100).notNull(),
        dropImage: text("drop_image").default("https://i.imgur.com/dFpT1Zy.jpg").notNull(),
        xpEnabled: integer("xp_enabled", {mode: "boolean"}).default(true).notNull(),
        levelMultiplier: integer("level_multiplier", {mode: "number"}).default(10).notNull(),
        dropMessage: text("drop_message").default("{emoji} {amount} has dropped into this channel!").notNull(),
        levelUpMessage: text("level_up_message").default("Congratulations {user}, you have leveled up to level {level}!").notNull(),
        levelUpDM: integer("level_up_dm", {mode: "boolean"}).default(true).notNull(),
        dropsCalculation: text("drops_calculation").default("5").notNull(),
        dropBlanks: integer("drop_blanks").default(0).notNull(),
        dropSecondsCooldown: integer("drop_seconds_cooldown", {mode: "number"}).default(5),
        destroyAt: integer("destroy_at", {mode: "timestamp"}),
    }, table => {
        return {
            destroyAtIdx: uniqueIndex("guilds_destroy_at_idx").on(table.destroyAt),
        };
    })
);

export const allowedDropChannels = takeable(
    sqliteTable("allowed_drop_channels", {
        channelId: blob("channel_id", { mode: "bigint" }).primaryKey(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        lastDrop: integer("last_drop", {mode: "timestamp"}),
    }, table => {
        return {
            guildIdIdx: index("adc_guild_id_idx").on(table.guildId),
        };
    })
);

export const lastGuildTakeout = sqliteTable("last_guild_takeout", {
    guildId: blob("guild_id", { mode: "bigint" }).primaryKey().references(() => guilds.guildId, {
        onDelete: "cascade",
    }),
    lastTakeout: integer("last_takeout", {mode: "timestamp"}).notNull(),
});

export const levelBlacklistedChannels = takeable(
    sqliteTable("level_blacklisted_channels", {
        channelId: blob("channel_id", { mode: "bigint" }).primaryKey(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
    }, table => {
        return {
            guildIdIdx: index("lbc_guild_id_idx").on(table.guildId),
        };
    })
);

export const experiencePoints = takeable(
    sqliteTable("experience_points", {
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        userId: blob("user_id", { mode: "bigint" }).notNull(),
        xp: integer("xp", {mode: "number"}).notNull(),
        totalXp: integer("total_xp", {mode: "number"}).default(0).notNull(),
        level: integer("level", {mode: "number"}).default(1).notNull(),
        lastXp: integer("last_xp", {mode: "timestamp"}).notNull(),
    }, table => {
        return {
            guildIdIdx: index("xp_guild_id_idx").on(table.guildId),
            guildMemberIdx: uniqueIndex("xp_guild_member_idx").on(table.guildId, table.userId),
            guildTotalXpIdx: index("xp_guild_total_xp_idx").on(table.guildId, table.totalXp),
        };
    })
);

export const currencyDrop = takeable(
    sqliteTable("currency_drop", {
        messageId: blob("message_id", { mode: "bigint" }).primaryKey(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        amount: integer("amount", {mode: "number"}).notNull(),
    }, table => {
        return {
            guildIdIdx: index("drop_guild_id_idx").on(table.guildId),
        };
    })
);

export const wallet = takeable(
    sqliteTable("wallet", {
        userId: blob("user_id", { mode: "bigint" }).notNull(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        balance: blob("balance", {mode: "bigint"}).notNull(),
    }, table => {
        return {
            guildIdIdx: index("wallet_guild_id_idx").on(table.guildId),
            guildMemberIdx: uniqueIndex("wallet_guild_member_idx").on(table.guildId, table.userId),
            guildBalanceIdx: index("wallet_guild_balance_idx").on(table.guildId, table.balance),
        };
    })
);

export const levelRoles = takeable(
    sqliteTable("level_roles", {
        roleId: blob("role_id", { mode: "bigint" }),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        userId: blob("user_id", { mode: "bigint" }).notNull(),
        level: integer("level", {mode: "number"}).notNull(),
    }, table => {
        return {
            guildIdIdx: index("lr_guild_id_idx").on(table.guildId),
            guildLevelIdx: index("lr_guild_level_idx").on(table.guildId, table.level),
            guildRoleLevelIdx: uniqueIndex("lr_guild_role_level_idx").on(table.guildId, table.level, table.roleId),
        };
    })
);

export const transactions = takeable(
    sqliteTable("transactions", {
        createdAt: integer("created_at", {mode: "timestamp"}).notNull(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        userId: blob("user_id", { mode: "bigint" }).notNull(),
        amount: blob("amount", { mode: "bigint" }).notNull(),
        reason: text("reason").notNull(),
    }, table => {
        return {
            guildIdIdx: index("tx_guild_id_idx").on(table.guildId),
            memberIdx: index("tx_member_idx").on(table.guildId, table.userId),
            createdAtIdx: index("tx_created_at_idx").on(table.guildId, table.userId, table.createdAt),
        };
    })
);

export const shares = takeable(
    sqliteTable("shares", {
        id: integer("id", {mode: "number"}).primaryKey({ autoIncrement: true }),
        createdAt: integer("created_at", {mode: "timestamp"}).notNull(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        userId: blob("user_id", { mode: "bigint" }).notNull(),
        invested: integer("invested", {mode: "number"}).notNull(),
        stockName: text("stock_name").notNull(),
        shareCount: integer("share_count", {mode: "number"}).notNull(),
    }, table => {
        return {
            guildIdIdx: index("shares_guild_id_idx").on(table.guildId),
            memberIdx: index("shares_member_idx").on(table.guildId, table.userId),
            createdAtIdx: index("shares_created_at_idx").on(table.guildId, table.userId, table.createdAt),
        };
    })
);

export const roleShop = takeable(
    sqliteTable("role_shop", {
        roleId: blob("role_id", { mode: "bigint" }).primaryKey(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        price: integer("price", {mode: "number"}).notNull(),
        revised: integer("revised", { mode: "boolean" }).default(false).notNull(),
    }, table => {
        return {
           guild_id_idx: index("role_shop_guild_id_idx").on(table.guildId),
        };
    })
);

export const timelyCollections = takeable(
    sqliteTable("timely_collections", {
        userId: blob("user_id", { mode: "bigint" }).notNull(),
        guildId: blob("guild_id", { mode: "bigint" }).notNull().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        lastCollected: integer("last_collected", {mode: "timestamp"}).notNull(),
    }, table => {
        return {
            guildIdIdx: index("timely_guild_id_idx").on(table.guildId),
            guildMemberIdx: uniqueIndex("timely_guild_member_idx").on(table.guildId, table.userId),
        };
    })
);

export const guildTimelyConfig = takeable(
    sqliteTable("guild_timely_config", {
        guildId: blob("guild_id", { mode: "bigint" }).primaryKey().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        enabled: integer("enabled", { mode: "boolean" }).default(false).notNull(),
        amount: integer("amount", {mode: "number"}).notNull().default(10),
        hoursBetweenCollections: integer("hours_between_collections", {mode: "number"}).notNull().default(24),
    })
);

export const dashboardAdmins = takeable(
    sqliteTable("dashboard_admins", {
        guildId: blob("guild_id", { mode: "bigint" }).references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        userId: blob("user_id", { mode: "bigint" }),
    }, table => {
        return {
            guildMemberIdx: uniqueIndex("admins_guild_member_idx").on(table.guildId, table.userId),
        };
    })
);

export const timeLocation = sqliteTable("time_locations", {
    userId: blob("user_id", { mode: "bigint" }).notNull().primaryKey(),
    location: text("location").notNull(),
});

export const birthdays = sqliteTable("birthdays", {
    userId: blob("user_id", { mode: "bigint" }).notNull().primaryKey(),
    day: integer("day", {mode: "number"}).notNull(),
    month: integer("month", {mode: "number"}).notNull(),
});

export const guildBirthdayConfig = takeable(
    sqliteTable("guild_birthday_config", {
        guildId: blob("guild_id", { mode: "bigint" }).primaryKey().references(() => guilds.guildId, {
            onDelete: "cascade",
        }),
        roleId: blob("role_id", { mode: "bigint" }),
        currency: integer("currency", {mode: "number"}).notNull().default(0),
        channelId: blob("channel_id", { mode: "bigint" }),
        birthdayMessage: text("birthday_message").notNull().default("{user} is 1 year older today! Wish them a happy birthday!"),
    })
);

// TODO: channel reminders

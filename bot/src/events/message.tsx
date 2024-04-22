import type { Message } from "discord.js";
import { getGuild } from "../queries/guild";
import {
    allowedDropChannels,
    client,
    currencyDrop,
    experiencePoints,
    guilds,
} from "database";
import { renderManager } from "../state";
import CurrencyDrop from "../shared/CurrencyDrop";
import { additionalXp, levelToXp } from "../utils/tasoAlgo";

async function handleDrops(
    message: Message,
    gid: bigint,
    guild: typeof guilds.$inferSelect,
) {
    // Check if we are not in the 5%.
    if (Math.random() > 0.05) return;

    // Return if drops are off.
    if (!guild.dropsEnabled) return;

    // Check if drops are allowed.
    const channelResult = await client.query.allowedDropChannels
        .findFirst({
            where: (channel, { and, eq }) =>
                and(
                    eq(channel.guildId, gid),
                    eq(channel.channelId, BigInt(message.channel.id)),
                ),
        })
        .execute();
    if (!channelResult) return;

    // Check if the channel is on cooldown.
    if (
        guild.dropSecondsCooldown &&
        channelResult.lastDrop &&
        Date.now() - channelResult.lastDrop.getTime() <
            guild.dropSecondsCooldown * 1000
    )
        return;

    // Generate a random uint between dropAmountMin and dropAmountMax.
    const amount =
        Math.floor(
            Math.random() * (guild.dropAmountMax - guild.dropAmountMin + 1),
        ) + guild.dropAmountMin;

    // Reply with the drop.
    const messagePtr: [Message | undefined] = [undefined];
    const reply = await renderManager.create(
        message.channel,
        <CurrencyDrop
            amount={amount}
            emoji={guild.currencyEmoji}
            blanks={guild.dropBlanks}
            description={guild.dropMessage}
            embedImageUrl={guild.dropImage}
            messagePtr={messagePtr}
        />,
    );
    messagePtr[0] = reply;

    // Insert the drop into the database.
    await client
        .insert(currencyDrop)
        .values({
            messageId: BigInt(reply.id),
            guildId: gid,
            amount,
        })
        .onConflictDoNothing()
        .execute();

    // Update the last drop time.
    await client
        .insert(allowedDropChannels)
        .values({
            guildId: gid,
            channelId: BigInt(message.channel.id),
            lastDrop: new Date(),
        })
        .onConflictDoUpdate({
            target: [
                allowedDropChannels.guildId,
                allowedDropChannels.channelId,
            ],
            set: {
                lastDrop: new Date(),
            },
        })
        .execute();
}

type UserXP = {
    userId: bigint;
    xp: number;
    totalXp: number;
    level: number;
};

// Matches no pings in the nickname.
const NO_PINGS_REGEX = /(no|do[-_ ]*not)[-_ ]*ping/gi;

async function handleLevelUp(
    message: Message,
    guild: typeof guilds.$inferSelect,
    userXp: UserXP,
) {
    // Get the level up message.
    const levelUpMessage = guild.levelUpMessage
        .replace(/{user}/g, `<@${userXp.userId}>`)
        .replace(/{level}/g, userXp.level.toString());

    // Check if we should DM this message.
    const channel = guild.levelUpDM ? message.author : message.channel;

    // Check if the user wants no pings.
    const nickname = message.member?.nickname;
    let userWantsNoPings = false;
    if (nickname) {
        userWantsNoPings = NO_PINGS_REGEX.test(nickname);
    }

    try {
        // Send the message.
        const msg = await channel.send({
            content: levelUpMessage,
            allowedMentions: userWantsNoPings
                ? {
                      parse: [],
                  }
                : undefined,
        });

        // If this isn't a DM, try to delete after 3 seconds.
        if (!guild.levelUpDM) {
            setTimeout(() => msg.delete().catch(() => {}), 3000);
        }
    } catch {
        // It's whatever. Ignore this.
    }
}

async function addXP(
    message: Message,
    guild: typeof guilds.$inferSelect,
    userXp: UserXP,
) {
    // Do the levelling.
    let xpToLevelUp = levelToXp(guild.levelMultiplier, userXp.level);
    const additional = additionalXp(userXp.level);
    userXp.xp += additional;
    const originalLevel = userXp.level;
    while (userXp.xp >= xpToLevelUp) {
        userXp.level++;
        userXp.xp -= xpToLevelUp;
        xpToLevelUp = levelToXp(guild.levelMultiplier, userXp.level);
    }
    userXp.totalXp += additional;

    // Write it all to the database.
    await client
        .insert(experiencePoints)
        .values({
            guildId: guild.guildId,
            userId: userXp.userId,
            xp: userXp.xp,
            totalXp: userXp.totalXp,
            level: userXp.level,
            lastXp: new Date(),
        })
        .onConflictDoUpdate({
            target: [experiencePoints.guildId, experiencePoints.userId],
            set: {
                xp: userXp.xp,
                totalXp: userXp.totalXp,
                level: userXp.level,
                lastXp: new Date(),
            },
        })
        .execute();

    // Handle level up messages if the user levelled up.
    if (originalLevel !== userXp.level)
        await handleLevelUp(message, guild, userXp);
}

async function handleXPRoles(
    message: Message,
    guild: typeof guilds.$inferSelect,
    userXp: UserXP,
) {
    // Get the roles.
    const roles = (
        await client.query.levelRoles
            .findMany({
                where: (role, { and, eq, lte }) =>
                    and(
                        eq(role.guildId, guild.guildId),
                        lte(role.level, userXp.level),
                    ),
            })
            .execute()
    ).map((r) => r.roleId);

    // Ensure the user has the roles.
    const member = message.member!;
    const promises = roles.map((roleId) => {
        return (async () => {
            try {
                await member.roles.add(roleId.toString(), "User levelled up.");
            } catch {
                // Ignore.
            }
        })();
    });
    await Promise.all(promises);
}

async function handleXP(
    message: Message,
    gid: bigint,
    guild: typeof guilds.$inferSelect,
) {
    // If XP is disabled, return.
    if (!guild.xpEnabled) return;

    // Get the user.
    const uid = BigInt(message.author.id);
    const userXp = (await client.query.experiencePoints
        .findFirst({
            where: (xp, { and, eq }) =>
                and(eq(xp.userId, uid), eq(xp.guildId, gid)),
        })
        .execute()) ?? {
        userId: uid,
        xp: 0,
        totalXp: 0,
        lastXp: null,
        level: 1,
    };

    // Handle if the user last got XP less than 20 seconds ago.
    if (userXp.lastXp && Date.now() - userXp.lastXp.getTime() < 20000) return;

    try {
        // Check if the user is disallowed from leveling in the channel they are in.
        const exists = await client.query.levelBlacklistedChannels
            .findFirst({
                where: (channel, { and, eq }) =>
                    and(
                        eq(channel.guildId, gid),
                        eq(channel.channelId, BigInt(message.channel.id)),
                    ),
            })
            .execute();
        if (exists) return;

        // Add the XP.
        await addXP(message, guild, userXp);
    } finally {
        // Make sure the user has the correct roles.
        await handleXPRoles(message, guild, userXp);
    }
}

export default async function (message: Message) {
    // Ignore DMs.
    if (!message.guild) return;

    // Ignore bots.
    if (message.author.bot) return;

    // Get the guild.
    const gid = BigInt(message.guild.id);
    const guild = await getGuild(gid);

    await Promise.all([
        // Handle random drops.
        handleDrops(message, gid, guild),

        // Handle XP.
        handleXP(message, gid, guild),
    ]);
}

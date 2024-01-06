import { CommandInteraction } from "discord.js";
import error from "./layouts/error";

export const insufficientFunds = (interaction: CommandInteraction, amount: number, emoji: string) =>
    error(
        interaction,
        "Insufficient Funds",
        `You need at least ${amount} ${emoji} to continue with this transaction.`,
    );

export const notAMember = (interaction: CommandInteraction) =>
    error(
        interaction,
        "Not a Member",
        "The user you specified is not a member of this server!",
    );

export const financialActionToSelf = (interaction: CommandInteraction) =>
    error(
        interaction,
        "Financial Action to Self",
        "You cannot perform a financial action on yourself!",
    );

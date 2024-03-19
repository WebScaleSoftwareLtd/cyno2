import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type AutocompleteFocusedOption,
    type ApplicationCommandOptionChoiceData,
    type CommandInteraction,
} from "discord.js";
import error from "../views/layouts/error";
import take from "../queries/financial/take";
import { insufficientFunds } from "../views/errors";
import { getGuild } from "../queries/guild";
import { client, shares } from "database";
import success from "../views/layouts/success";
import yahooFinance from "yahoo-finance2";

export const description = "Allows you to invest your currency in a stock.";

export const options: APIApplicationCommandOption[] = [
    {
        name: "amount",
        description: "The amount you wish to invest.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
    },
    {
        name: "stock_symbol",
        description: "The symbol of the stock.",
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
    },
];

export const autocompleteHandler = async (
    interaction: AutocompleteFocusedOption,
): Promise<ApplicationCommandOptionChoiceData[]> => {
    // Handle if the interaction is not for the stock symbol.
    if (interaction.name !== "stock_symbol") return [];

    // Get the quotes.
    const q = interaction.value as string;
    if (q === "") return [];
    let quotes = (await yahooFinance.search(q)).quotes;

    // Make sure we only have a maximum of 25 quotes.
    quotes = quotes
        .slice(0, 25)
        .filter((quote) => quote.symbol && quote.shortname);

    // Return the choices.
    return quotes.map((quote) => ({
        name: quote.shortname,
        value: quote.symbol,
    }));
};

export async function run(interaction: CommandInteraction) {
    // Get the stock.
    const stock = await yahooFinance.quote(
        interaction.options.get("stock_symbol")!.value as string,
        {
            fields: ["regularMarketPrice", "shortName"],
        },
    );
    if (!stock) {
        return error(
            interaction,
            "Invalid Stock Specified",
            "The stock you specified is invalid.",
        );
    }

    // Take the money.
    const amount = interaction.options.get("amount")!.value as number;
    const gid = BigInt(interaction.guildId!);
    const uid = BigInt(interaction.user.id);
    const sufficientFunds = await take(
        gid,
        uid,
        BigInt(amount),
        `Invested in ${stock.shortName}`,
    );
    const guild = await getGuild(gid);
    if (!sufficientFunds)
        return insufficientFunds(interaction, amount, guild.currencyEmoji);

    // Handle if the regular market price is zero.
    if (!stock.regularMarketPrice) {
        return error(
            interaction,
            "Cannot Invest In Share",
            "You cannot invest in this share since it does not have a USD price.",
        );
    }
    const shareCount = Math.floor(amount / stock.regularMarketPrice) || 1;

    // Write the stock to the database.
    await client
        .insert(shares)
        .values({
            createdAt: new Date(),
            guildId: gid,
            userId: uid,
            invested: amount,
            stockName: stock.symbol,
            shareCount,
        })
        .execute();

    // Respond to the user.
    success(
        interaction,
        "Investment Successful",
        `You successfully invested ${guild.currencyEmoji} ${amount} in ${stock.shortName}.`,
    );
}

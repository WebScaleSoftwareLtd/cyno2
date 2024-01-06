import {
    ApplicationCommandOptionType,
    type APIApplicationCommandOption,
    type AutocompleteFocusedOption,
    type ApplicationCommandOptionChoiceData,
    type CommandInteraction,
} from "discord.js";
import axios from "axios";

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

interface QuotePartial {
    symbol: string;
    shortname: string;
}

export const autocompleteHandler = async (
    interaction: AutocompleteFocusedOption,
): Promise<ApplicationCommandOptionChoiceData[]> => {
    // Handle if the interaction is not for the stock symbol.
    if (interaction.name !== "stock_symbol") return [];

    // Get the quotes.
    const q = interaction.value as string;
    if (q === "") return [];
    const response = await axios.get(
        "https://query1.finance.yahoo.com/v1/finance/search",
        {
            params: { q },
            responseType: "json",
        },
    );
    let quotes = response.data.quotes as QuotePartial[];

    // Make sure we only have a maximum of 25 quotes.
    quotes = quotes.slice(0, 25);

    // Return the choices.
    return quotes.map(quote => ({
        name: quote.shortname,
        value: quote.symbol,
    }));
};

export async function run(interaction: CommandInteraction) {
    interaction.reply("Hello World!");
}

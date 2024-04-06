import {
    ApplicationCommandOptionType,
    type APIApplicationCommandBasicOption,
    type CommandInteraction,
} from "discord.js";
import error from "../views/layouts/error";
import * as PImage from "pureimage";
import { Writable } from "stream";
import parse from "color-parse";

export const description = "Renders the specified color.";

export const options: APIApplicationCommandBasicOption[] = [
    {
        name: "color",
        description:
            "The color hex, RGB(R,G,B), or RGBA(R,G,B,A) you wish to render.",
        type: ApplicationCommandOptionType.String,
        required: true,
    },
];

class WriteableBuffer extends Writable {
    buffer: Buffer;

    constructor() {
        super();
        this.buffer = Buffer.alloc(0);
    }

    _write(chunk: Buffer, _: string, callback: () => void) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        callback();
    }
}

export async function run(interaction: CommandInteraction) {
    // Get the color.
    const color = parse(interaction.options.get("color")!.value as string)
        .values as [number, number, number] | [];

    // If the color is invalid, return an error.
    if (!color.length) {
        return error(
            interaction,
            "Invalid Color",
            "The color you specified is invalid!",
        );
    }

    // Create the image.
    const img = PImage.make(100, 100);
    const ctx = img.getContext("2d");
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fillRect(0, 0, 100, 100);

    // Encode the image.
    const buf = new WriteableBuffer();
    await PImage.encodePNGToStream(img, buf);

    // Send the png.
    return interaction.reply({
        files: [
            {
                attachment: buf.buffer,
                name: "color.png",
            },
        ],
    });
}

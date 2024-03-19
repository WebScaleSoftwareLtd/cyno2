import { Embed } from "react-djs";
import { renderManager } from "../../state";
import type { CommandInteraction } from "discord.js";

export default (
    interaction: CommandInteraction,
    reason: string,
    description: string,
) => {
    const embed = (
        <Embed title={reason} description={description} color={0x00ff00} />
    );
    return renderManager.reply(interaction, embed, { ephemeral: true });
};

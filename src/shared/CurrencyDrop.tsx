import { Button, Embed } from "react-djs";
import { useState } from "react";
import { ButtonStyle, Message, MessageComponentInteraction } from "discord.js";
import { client, currencyDrop } from "../database";
import { eq } from "drizzle-orm";
import add from "../queries/financial/add";
import rowsAffected from "../database/rowsAffected";

type Props = {
    blanks: number;
    amount: bigint;
    emoji: string;
    description: string;
    embedImageUrl: string;
    messagePtr: [Message | undefined];
};

export default ({ blanks, amount, emoji, description, embedImageUrl, messagePtr }: Props) => {
    // Create the drop index.
    const [dropIndex] = useState(() => Math.floor(Math.random() * (blanks || 0)));

    // Defines the collector for the drop.
    const [collector, setCollector] = useState<string | undefined>();

    // If there is a collector, return a ending embed.
    if (collector) {
        return <Embed
            description={`<@${collector}> picked up ${emoji} ${amount}!`}
        />;
    }

    // Create the blank buttons.
    const buttons: JSX.Element[] = [];
    for (let i = 0; i < blanks; i++) {
        buttons.push(<Button
            label={"\u200b"}
            onClick={() => {}}
            key={i}
        />);
    }

    // Create the drop button at the drop index.
    buttons.splice(dropIndex, 0, <Button
        label={`${amount}`}
        onClick={async (ev: MessageComponentInteraction) => {
            // Make sure message is set in the message pointer.
            const message = messagePtr[0];
            if (!message) return;
    
            // Attempt to delete the drop from the database.
            const deleteResult = await client.delete(currencyDrop).where(
                eq(currencyDrop.messageId, BigInt(message.id)),
            ).execute();
    
            // If nothing was deleted, return.
            if (rowsAffected(deleteResult) === 0) return;
    
            // Set the collector.
            setCollector(ev.user.id);
    
            // Give the user their currency.
            await add(
                BigInt(message.guildId!),
                BigInt(ev.user.id),
                amount,
                `Collected drop in <#${message.channelId}>`,
            );
    
            // In 5 seconds, delete the message.
            setTimeout(() => message.delete(), 5000);
        }}
        emoji={emoji}
        style={ButtonStyle.Primary}
        key="__drop__"
    />);

    // Return the embed and buttons.
    return <>
        <Embed
            description={description.
                replaceAll("{amount}", `${amount}`).
                replaceAll("{emoji}", emoji)}
            image={{
                url: embedImageUrl,
            }}
        />
        {buttons}
    </>;
};

"use client";

import React from "react";
import Loading from "../atoms/Loading";
import { Theme } from "emoji-picker-react";
import FloatingContainer from "../atoms/FloatingContainer";

// Start the import as soon as the page loads.
const pickerImport = import("emoji-picker-react");
const EmojiPicker = React.lazy(() => pickerImport);

export type DiscordEmoji = {
    id: string;
    name: string;
    animated?: boolean;
};

type Props = {
    value: string | null;
    onChange: (value: string) => void;
    emojis: DiscordEmoji[];
};

function emoji2url(emoji: string) {
    // Check if it is a Discord emoji. If so, return the URL.
    const match = emoji.match(/^<(a?):\w+:(\d+)>$/);
    if (match) {
        return `https://cdn.discordapp.com/emojis/${encodeURIComponent(match[2])}.${match[1] ? "gif" : "png"}`;
    }

    // Return the URL of the emoji.
    return `https://twemoji.maxcdn.com/v/latest/72x72/${encodeURIComponent(emoji.codePointAt(0)!.toString(16))}.png`;
}

function emoji2alt(emoji: string) {
    // Check if it is a Discord emoji. If so, return the name.
    const match = emoji.match(/^<(a?):(\w+):(\d+)>$/);
    if (match) return match[2];

    // Return the emoji itself.
    return emoji;
}

export default function DiscordEmojiPicker({ value, onChange, emojis }: Props) {
    const [pickerVisible, setPickerVisible] = React.useState(false);

    return <>
        <form
            onSubmit={e => {
                e.preventDefault();
                setPickerVisible(x => !x);
            }}
            aria-haspopup={pickerVisible ? "true" : "false"}
        >
            <button type="submit" className="h-10 w-10 p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
                {value ? <img
                    src={emoji2url(value)} alt={emoji2alt(value)}
                    loading="lazy"
                /> : <i>No emoji selected.</i>}
            </button>
        </form>

        {
            pickerVisible && <FloatingContainer>
                <React.Suspense fallback={<Loading />}>
                    <EmojiPicker
                        theme={Theme.AUTO}
                        onEmojiClick={(e) => {
                            onChange(e.emoji);
                            setPickerVisible(false);
                        }}
                        customEmojis={emojis.map(emoji => ({
                            id: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`, // Discord emoji format: <:name:id> or <a:name:id> for animated.
                            names: [emoji.name],
                            imgUrl: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`,
                        }))}
                    />
                </React.Suspense>
            </FloatingContainer>
        }
    </>;
}

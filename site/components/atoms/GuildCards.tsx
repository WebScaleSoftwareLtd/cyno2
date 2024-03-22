"use client";

import Button from "./Button";

type GuildCardProps = {
    guildId: string;
    guildName: string;
    guildImage: string | null;
    url: string;
    enabled: boolean;
    buttonText: string;
};

function GuildCard({ guildId, guildName, guildImage, url, enabled, buttonText }: GuildCardProps) {
    return (
        <div className="w-full align-middle">
            <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg w-3/4">
                <p>
                    <img
                        src={guildImage ? `https://cdn.discordapp.com/icons/${guildId}/${guildImage}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`}
                        alt=""
                        className="mx-auto w-12 h-12 rounded-full"
                    />
                </p>
                <h4 className="text-md font-bold text-center mt-3 select-none">{guildName}</h4>
                <div className="flex justify-center mt-5 mb-3">
                    <Button
                        label={buttonText}
                        disabled={!enabled}
                        style="standard"
                        link={url}
                    />
                </div>
            </div>
        </div>
    );
}

export type GuildCardsProp = {
    title: string;
    description: string;
    cards: GuildCardProps[];
};

export default function GuildCards({ title, description, cards }: GuildCardsProp) {
    return (
        <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-500 dark:text-gray-200 mt-2">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
                {cards.sort(
                    (a, b) => a.guildName.localeCompare(b.guildName),
                ).map((card) => (
                    <GuildCard {...card} key={card.guildId} />
                ))}
            </div>
        </div>
    );
}

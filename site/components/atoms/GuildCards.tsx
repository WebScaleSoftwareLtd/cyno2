"use client";

type GuildCardProps = {
    guildName: string;
    guildImage: string | null;
    url: string;
    enabled: boolean;
    buttonText: string;
};

function GuildCard({ guildName, url, enabled, buttonText }: GuildCardProps) {
    return <p>hello</p>;
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
            <p className="text-gray-500 dark:text-gray-200">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.sort(
                    (a, b) => a.guildName.localeCompare(b.guildName),
                ).map((card) => (
                    <GuildCard {...card} />
                ))}
            </div>
        </div>
    );
}

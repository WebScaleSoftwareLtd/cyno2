"use client";

import Select from "react-select";
import type { Channel } from "../server/cached/getGuildChannels";
import selectTailwindClasses from "../utils/selectTailwindClasses";

type Props = {
    channels: Channel[];
    records: bigint[];
    remove: (channelId: bigint) => Promise<void>;
    insert: (channelId: bigint) => Promise<void>;
    multiple: boolean;
};

export default function ChannelPicker(props: Props) {
    // Map the options.
    const options = props.channels.map((channel) => ({
        value: channel.name,
        data: channel.id,
        label: `#${channel.name}`,
    }));

    // Get the selected options.
    const selected = props.multiple ? options.filter(
        (option) => props.records.includes(BigInt(option.data)),
    ) : options.find(
        (option) => props.records.includes(BigInt(option.data)),
    );

    // Return the react-select menu.
    return (
        <Select
            isSearchable={true}
            isClearable={false}
            isMulti={props.multiple}
            defaultValue={selected}
            options={options}
            onChange={(value) => {
                // Handles if no value is selected.
                if (!value) return;

                // Handles if a single value is selected.
                if ("data" in value) {
                    props.insert(BigInt(value.data));
                    return;
                }
            }}
            classNames={selectTailwindClasses}
        />
    );
}

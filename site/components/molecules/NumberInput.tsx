"use client";

import React from "react";
import OptionCard from "../atoms/OptionCard";

type Props = {
    title: string;
    description: string;
    defaultValue: number;
    onChange: (value: number) => Promise<void>;
    min?: number;
    max?: number;
};

export default function NumberInput(props: Props) {
    const [value, setValue] = React.useState(props.defaultValue);

    const changeHandler = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            // If it is Infinity or NaN, set it to the default value.
            if (!isFinite(e.target.valueAsNumber)) {
                setValue(props.defaultValue);
                return;
            }

            // Initially, set to the value of the number.
            setValue(e.target.valueAsNumber);

            props.onChange(e.target.valueAsNumber).catch((e) => {
                // If it fails, revert the number.
                setValue(value);

                // Log the error.
                console.error(e);
            });
        },
        [props.onChange, value],
    );

    return (
        <OptionCard title={props.title} description={props.description}>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="number"
                    min={props.min}
                    max={props.max}
                    value={value}
                    className="w-full p-2 dark:bg-gray-900 rounded-lg"
                    onChange={changeHandler}
                />
            </form>
        </OptionCard>
    );
}

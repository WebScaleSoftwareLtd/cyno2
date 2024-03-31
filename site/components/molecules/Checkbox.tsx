"use client";

import React from "react";
import OptionCard from "../atoms/OptionCard";

type Props = {
    title: string;
    description: string;
    defaultValue: boolean;
    onChange: (value: boolean) => Promise<void>;
};

export default function Checkbox(props: Props) {
    const [checked, setChecked] = React.useState(props.defaultValue);

    function changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
        // Initially, set to the value of the checkbox.
        setChecked(e.target.checked);

        props.onChange(e.target.checked).catch((e) => {
            // If it fails, revert the checkbox.
            setChecked((x) => !x);

            // Log the error.
            console.error(e);
        });
    }

    return (
        <OptionCard title={props.title} description={props.description}>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={changeHandler}
                />{" "}
                {props.title}
            </form>
        </OptionCard>
    );
}

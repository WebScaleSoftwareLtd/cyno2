"use client";

import React from "react";
import OptionCard from "../atoms/OptionCard";
import Alert from "../atoms/Alert";
import { ZodError } from "zod";
import { constructValidator, Validator } from "@/utils/jsonTextValidator";

type Props = {
    title: string;
    description: string;
    defaultValue: string;
    onChange: (value: string) => Promise<void>;
    validator?: Validator;
};

export default function TextInput(props: Props) {
    const [alert, setAlert] = React.useState<string | null>(null);
    const [value, setValue] = React.useState(props.defaultValue);

    const changeHandler = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            // Initially, set to the value of the string.
            setValue(e.target.value);

            // Attempt to validate.
            try {
                if (props.validator)
                    constructValidator(props.validator).parse(e.target.value);
                setAlert(null);
            } catch (e) {
                setAlert((e as ZodError).errors[0].message);
                return;
            }

            // Write to the server.
            props.onChange(e.target.value).catch((e) => {
                // Set to the initial value.
                setValue(value);

                // Log out ot the console.
                console.error(e);
            });
        },
        [props.onChange, value],
    );

    return (
        <OptionCard title={props.title} description={props.description}>
            {alert && (
                <div className="mb-4">
                    <Alert severity="error">{alert}</Alert>
                </div>
            )}
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    value={value}
                    className="w-full p-2 dark:bg-gray-900 rounded-lg"
                    onChange={changeHandler}
                />
            </form>
        </OptionCard>
    );
}

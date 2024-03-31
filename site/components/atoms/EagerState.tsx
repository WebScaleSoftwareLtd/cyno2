"use client";

import React from "react";

type Props<
    Value,
    InnerProps extends {
        value: Value | null;
        onChange: (value: Value) => void;
    },
> = {
    component: React.ComponentType<InnerProps>;
    props: Omit<InnerProps, "value" | "onChange">;
    initialValue: Value | null;
    update: (value: Value) => Promise<void>;
};

export default function EagerState<
    Value,
    InnerProps extends {
        value: Value | null;
        onChange: (value: Value) => void;
    },
>(props: Props<Value, InnerProps>) {
    const Component = props.component;
    const [value, setValue] = React.useState(props.initialValue);

    const update = React.useCallback(
        (newValue: Value) => {
            // Set to the new value.
            setValue(newValue);

            // Try to update the value.
            props.update(newValue).catch((e) => {
                // If it fails, revert the value to the old one.
                setValue(value);

                // Show an error message.
                console.error(e);
            });
        },
        [value, props.update],
    );

    return (
        <Component
            {...(props.props as InnerProps)}
            value={value}
            onChange={update}
        />
    );
}

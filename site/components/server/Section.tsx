import React from "react";

type Props = React.PropsWithChildren<{
    title: string;
}>;

export default function Section({ title, children }: Props) {
    return (
        <>
            <section>
                <h2 className="text-xl ml-1 mb-4">{title}</h2>

                {children}
            </section>
            <hr className="mt-6 mb-4 border-gray-200 dark:border-gray-800 last:hidden" />
        </>
    );
}

"use client";

import React from "react";

export default function FloatingContainer({ children }: React.PropsWithChildren<{}>) {
    return <div className="fixed mt-2 max-sm:mt-0 max-sm:absolute max-sm:right-2 max-sm:bottom-2">
        {children}
    </div>;
}

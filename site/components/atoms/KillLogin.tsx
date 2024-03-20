"use client";

import { useEffect } from "react";

export default function KillLogin() {
    useEffect(() => {
        document.cookie = "encrypted_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    }, []);

    return <></>;
}

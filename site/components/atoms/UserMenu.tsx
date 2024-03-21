"use client";

import type { User } from "@/utils/getDiscordUser";
import Link from "next/link";
import { FormEvent, useState } from "react";

const buttonStyle = "w-full hover:bg-gray-100 dark:hover:bg-gray-900 p-1 rounded-md text-left";

export default function UserMenu({ user }: { user: User }) {
    const [isOpen, setIsOpen] = useState(false);

    const logout = (e: FormEvent) => {
        e.preventDefault();
        document.cookie = "encrypted_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    };

    return (
        <div className="relative">
            <button className="flex items-center" aria-haspopup="menu" onClick={() => setIsOpen((prev) => !prev)}>
                <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt=""
                    className="h-8 w-8 rounded-full"
                />
                <span className="ml-2">{user.username}</span>
            </button>
            {
                isOpen && (
                    <div className="absolute top-9 right-0 bg-white dark:bg-gray-950 shadow-lg rounded-md p-3">
                        <p className={buttonStyle}>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        setIsOpen(false);
                                    }
                                }}
                            >
                                Dashboard
                            </Link>
                        </p>

                        <hr className="my-3 border-gray-200 dark:border-gray-800" />

                        <form onSubmit={logout}>
                            <button className={buttonStyle}>Logout</button>
                        </form>
                    </div>
                )
            }
        </div>
    );
}

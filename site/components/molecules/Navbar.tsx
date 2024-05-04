import React from "react";
import AvatarMenu from "../server/UserSidebar";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="dark:bg-slate-800 p-2 pr-4 flex justify-between items-center shadow-md dark:shadow-lg">
            <Link href="/" className="text-lg font-bold">
                <Image
                    src="/cyno_small.png"
                    alt="Cyno"
                    className="drop-shadow-md dark:drop-shadow-none"
                    width={50}
                    height={50}
                />
            </Link>
            <div>
                <React.Suspense fallback={<></>}>
                    <AvatarMenu />
                </React.Suspense>
            </div>
        </nav>
    );
}

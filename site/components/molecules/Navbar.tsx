import React from "react";
import AvatarMenu from "../atoms/UserSidebar";
import Link from "next/link";

export default () => {
    // TODO: Make link a image
    return (
        <nav className="dark:bg-slate-800 p-4 flex justify-between items-center shadow-lg">
            <Link href="/" className="text-lg font-bold">
                Cyno
            </Link>
            <div>
                <React.Suspense fallback={<></>}>
                    <AvatarMenu />
                </React.Suspense>
            </div>
        </nav>
    );
};

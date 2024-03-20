import React from "react";
import AvatarMenu from "../atoms/AvatarMenu";

export default () => {
    // TODO: Make link a image
    return (
        <nav className="dark:bg-slate-800 p-4 flex justify-between items-center shadow-lg">
            <a href="/" className="text-lg font-bold">
                Cyno
            </a>
            <div>
                <React.Suspense fallback={<></>}>
                    <AvatarMenu />
                </React.Suspense>
            </div>
        </nav>
    );
};

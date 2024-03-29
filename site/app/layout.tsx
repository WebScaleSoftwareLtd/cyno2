import "./globals.css";
import React from "react";
import Navbar from "@/components/molecules/Navbar";

export const metadata = {
    title: "Cyno",
    description: "Cyno is a Discord bot to add some fun into your server!",
};

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
    return (
        <html lang="en">
            <body className="dark:bg-slate-900 dark:text-white">
                <Navbar />
                <div className="m-12">
                    {children}
                </div>
            </body>
        </html>
    );
}

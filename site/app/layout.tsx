import "./globals.css";
import React from "react";
import Navbar from "@/components/molecules/Navbar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
    title: "Cyno",
    description: "Cyno is a Discord bot to add some fun into your server!",
};

export const runtime = process.env.NODE_RUNTIME === "1" ? "nodejs" : "edge";

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
    return (
        <html lang="en">
            <head>
                <meta name="darkreader-lock" />
            </head>

            <body className="dark:bg-slate-900 dark:text-white">
                <Navbar />
                {children}
                {process.env.NODE_RUNTIME !== "1" && (
                    <>
                        <Analytics />
                        <SpeedInsights />
                    </>
                )}
            </body>
        </html>
    );
}

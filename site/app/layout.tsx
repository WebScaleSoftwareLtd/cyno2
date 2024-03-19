import "./globals.css";

export const metadata = {
    title: "Cyno",
    description: "Cyno is a Discord bot to add some fun into your server!",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

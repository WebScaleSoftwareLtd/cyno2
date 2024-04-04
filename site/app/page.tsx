import React from "react";
import Button from "@/components/atoms/Button";
import HomeSplash from "@/components/atoms/HomeSplash";
import getUser from "@/components/server/cached/getUser";
import Image from "next/image";
import inviteUrl from "@/utils/inviteUrl";

async function UserButton({
    fallback: C,
}: {
    fallback: () => React.ReactNode;
}) {
    return (await getUser()) ? (
        <Button link="/dashboard" label="Dashboard" style="standard" />
    ) : (
        <C />
    );
}

async function LazyButton() {
    const fallback = () => (
        <Button link="/api/auth" label="Login" style="standard" />
    );

    return (
        <React.Suspense fallback={fallback()}>
            <UserButton fallback={fallback} />
        </React.Suspense>
    );
}

async function Feature({
    url,
    title,
    children,
}: React.PropsWithChildren<{ url: string; title: string }>) {
    return (
        <div className="flex-col m-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 max-w-72 text-center">
            <Image
                src={url}
                alt=""
                width={400}
                height={400}
                className="mx-auto"
            />

            <h3 className="text-lg font-semibold mt-2">{title}</h3>
            <p>{children}</p>
        </div>
    );
}

export default async function Home() {
    return (
        <main>
            <HomeSplash>
                <Image
                    src="/cyno.png"
                    alt="Cyno"
                    className="mb-6"
                    width={200}
                    height={127}
                />

                <div className="flex">
                    <div className="flex-col">
                        <Button
                            link={inviteUrl()}
                            label="Invite Cyno"
                            style="standard"
                        />
                    </div>

                    <div className="flex-col pl-4">
                        <LazyButton />
                    </div>
                </div>
            </HomeSplash>

            <section className="p-10">
                <h2 className="text-2xl font-semibold mb-4">
                    Cyno makes your Discord server more fun!
                </h2>
                <p className="mb-4">
                    Cyno is a{" "}
                    <a
                        href="https://github.com/webscalesoftwareltd/cyno2"
                        className="text-blue-900 dark:text-blue-300"
                    >
                        open source and MIT licensed
                    </a>{" "}
                    Discord bot that adds fun functionality to your server:
                </p>

                <div className="flex flex-wrap">
                    <Feature url="/balance.png" title="Economy">
                        Cyno supports a fully featured economy system with
                        wallets, sharing currency, and testing your luck with
                        your currency.
                    </Feature>

                    <Feature url="/drop.png" title="Currency Drops">
                        Cyno drops currency in your server for your members to
                        collect.
                    </Feature>

                    <Feature url="/roleshop.png" title="Role Shop">
                        Set roles that members can buy with the currency they
                        collect.
                    </Feature>
                </div>
            </section>
        </main>
    );
}

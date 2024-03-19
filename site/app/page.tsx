import { client } from "database";

export default async function Home() {
    const guilds = await client.query.guilds.findMany().execute();
    console.log(guilds);

    return (
        <main>
        </main>
    );
}

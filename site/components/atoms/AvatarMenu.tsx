import getDiscordUser from "@/utils/getDiscordUser";

export default async function () {
    // This is a double request. I hate it, but due to how App Router works, this is how it is.
    const user = await getDiscordUser();
    if (!user) {
        return (
            <a href="/api/auth">Login</a>
        );
    }

    // Show a dropdown menu with the user's avatar/username.
    return (
        <div className="relative">
            <button className="flex items-center">
                <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" className="h-8 w-8 rounded-full" />
                <span className="ml-2">{user.username}</span>
            </button>
            <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md p-2">
                <a href="/api/auth/logout">Logout</a>
            </div>
        </div>
    );
}

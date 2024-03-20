import getDiscordUser from "@/utils/getDiscordUser";
import UserMenu from "./UserMenu";

export default async function () {
    // This is a double request. I hate it, but due to how App Router works, this is how it is.
    const user = await getDiscordUser();
    if (!user) {
        return <a href="/api/auth">Login</a>;
    }

    // Show a dropdown menu with the user's avatar/username.
    return <UserMenu user={user} />;
}

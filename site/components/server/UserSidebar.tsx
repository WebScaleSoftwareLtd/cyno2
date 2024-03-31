import getUser from "./cached/getUser";
import UserMenu from "../atoms/UserMenu";

export default async function () {
    // Get the user.
    const user = await getUser();
    if (!user) {
        return <a href="/api/auth">Login</a>;
    }

    // Show a dropdown menu with the user's avatar/username.
    return <UserMenu user={user} />;
}

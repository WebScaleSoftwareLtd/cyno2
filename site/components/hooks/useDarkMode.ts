import { useSyncExternalStore } from "react";

export default function useDarkMode() {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    return useSyncExternalStore(
        watcher => {
            matcher.addEventListener("change", watcher);
            return () => matcher.removeEventListener("change", watcher);
        },
        () => matcher.matches,
    );
}

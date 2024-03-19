// This is some old code by Kelwing ran through ChatGPT to make it JS.

function mxp(cl: number) {
    return 45 + Math.floor(5 * cl);
}

function diff(cl: number) {
    switch (true) {
        case cl === 29:
            return 1;
        case cl === 30:
            return 3;
        case cl === 31:
            return 6;
        case cl >= 32:
            return 5 * (cl - 30);
        default:
            return 0;
    }
}

// Takes a level and returns the amount of XP required to reach that level.
export function levelToXp(mul: number, cl: number) {
    return Math.floor((mul * cl + diff(cl)) * mxp(cl));
}

// This is the amount of XP that is added to the player at the specified level.
export function additionalXp(cl: number) {
    return cl * 5 + 45;
}

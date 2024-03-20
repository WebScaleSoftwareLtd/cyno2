import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Check if the state is valid.
    console.log(req.cookies, req.nextUrl.searchParams.get("state"));
    if (req.cookies.get("state")?.value !== req.nextUrl.searchParams.get("state")) {
        // Redirect the user to the homepage.
        return NextResponse.redirect(`${req.nextUrl.origin}/`);
    }

    return new NextResponse("TODO: Implement the callback.");
}

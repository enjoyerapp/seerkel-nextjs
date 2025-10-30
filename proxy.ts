// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value

    function checkRedirects(req: NextRequest) {
        if (req.url.includes("/profile")) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        return null
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)
            req.headers.set("x-user-id", (decoded as any).uid)
        } catch (error) {
            console.log(error);
            if (checkRedirects(req)) {
                return checkRedirects(req)
            }
        }
    } else {
        if (checkRedirects(req)) {
            return checkRedirects(req)
        }
    }

    return NextResponse.next()
}

// Optionally protect only certain routes
export const config = {
    matcher: ["/", "/search", "/profile"], // adjust as needed
}

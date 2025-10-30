import { auth } from "@/firebaseAdmin";
import { OAuth2Client } from "google-auth-library"
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
    const { googleCode } = await request.json()

    if (!googleCode) {
        return Response.json({ message: "Error" }, { status: 400 })
    }
    
    const url = new URL(request.url);
    const combined = `${url.protocol}//${url.hostname}`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: googleCode,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!, // keep on server
            redirect_uri: `${combined}/login`,
            grant_type: "authorization_code",
        }),
    });
    const tokens = await tokenRes.json()
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload) {
        return Response.json({ message: "Error" }, { status: 401 })
    }

    // Create/get Firebase user
    let user
    try {
        user = await auth.getUserByEmail(payload.email!)
    } catch (err: any) {
        if (err.code === "auth/user-not-found") {
            user = await auth.createUser({
                uid: payload.sub,
                email: payload.email,
                displayName: payload.name,
                photoURL: payload.picture,
                emailVerified: true,
            })
        } else {
            return Response.json({ message: "Error" }, { status: 404 })
        }
    }

    // Optional: Create custom Firebase token

    const token = jwt.sign(
        { uid: user.uid },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" }
    )

    // Set JWT in HttpOnly cookie
    const res = NextResponse.json({ status: "success", uid: user.uid })
    res.cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "strict",
    })

    return res
}
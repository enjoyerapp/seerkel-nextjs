// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/firebaseAdmin"
import { User } from "@/models/user";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const username = url.searchParams.get("u")?.trim()

    const token = request.cookies.get("token")?.value

    if (!token && !username) return NextResponse.json({ uid: null }, { status: 500 })
    var userId

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
            userId = decoded.uid
        } catch (e) {
            if (!username) {
                return NextResponse.json({ user: null }, { status: 401 })
            }
        }
    }

    if (username) {
        const res = await db.collection("users").where("username", "==", username).limit(1).get()
        if (res.empty) {
            return NextResponse.json({ user: null }, { status: 404 })
        }
        const data = res.docs[0].data()

        return NextResponse.json({ user: { ...data, isOwnProfile: data.id == userId } as User })
    } else if (userId) {
        const res = await db.collection("users").doc(userId).get()
        const data = res.data()!        

        return NextResponse.json({ user: { ...data, isOwnProfile: data.id == userId } as User })
    }

    return NextResponse.json({ user: null }, { status: 404 })
}

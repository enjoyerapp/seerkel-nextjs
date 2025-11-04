// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/firebaseAdmin"

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ uid: null }, { status: 401 })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
        const res = await db.collection("users").doc(decoded.uid).get()

        return NextResponse.json({ user: res.data() })
    } catch (e) {
        return NextResponse.json({ user: null }, { status: 401 })
    }
}

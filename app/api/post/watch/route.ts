import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"


export async function POST(req: NextRequest) {
    const { postId } = await req.json()

    let userId: string | null = null

    const token = req.cookies.get("token")?.value

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
            userId = decoded.uid
        } catch (e) {
            console.log(e);
        }
    }

    if (userId == null) {
        return NextResponse.json({ uid: null }, { status: 401 })
    }


}
// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/firebaseAdmin";
import { User } from "@/models/user";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    const { postId, reactionKey, isLike } = await req.json()
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ uid: null }, { status: 401 })

    let userId: string | null = null

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
        userId = decoded.uid
    } catch (e) {
        return NextResponse.json({ uid: null }, { status: 401 })
    }

    if (!userId) return NextResponse.json({ uid: null }, { status: 404 })
    if (!postId) return NextResponse.json({ uid: null }, { status: 400 })

    if (!isLike) {
        const ref = db.collection("posts").doc(postId).collection("likes").doc(userId)
        const resGet = await ref.get()
        if (!resGet.exists) return NextResponse.json({ message: "Done" })

        const key = resGet.data()!.reaction_key
        await ref.delete()

        const resPost = await db.collection("posts").doc(postId).get()
        const reactions: Record<string, number> = resPost.data()!.reactions;

        if (Object.keys(reactions).includes(key) && reactions[key] > 0) {
            reactions[key] = reactions[key] - 1
        }

        const dataRes: Record<string, any> = {
            reactions: reactions
        }

        if (resPost.data()!.like_count > 0) {
            dataRes["like_count"] = FieldValue.increment(-1)
        }

        console.log(dataRes);

        await db.collection("posts").doc(postId).update(dataRes)

        return NextResponse.json({ message: "Done" })
    }

    const resPost = await db.collection("posts").doc(postId).get()
    if (!resPost.exists) return NextResponse.json({ uid: null }, { status: 400 })
    const partnerId = resPost.data()!.user_id
    const resAll = await db.getAll(db.collection("users").doc(partnerId), db.collection("users").doc(userId!))
    if (!resAll[0].exists || !resAll[1].exists) return NextResponse.json({ uid: null }, { status: 400 })
    const partnerData = resAll[0].data()! as User
    const userData = resAll[1].data()! as User

    const res = await fetch("https://us-central1-enjoyer-fa76d.cloudfunctions.net/likePost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: {
                "postId": postId,
                "partnerName": partnerData.name,
                "partnerId": partnerId,
                "userName": userData.name,
                "fcmToken": partnerData.fcm_token,
                "language": partnerData.language ?? "en",
                "userPic": userData.photo_url ?? "",
                "key": reactionKey,
                "reaction": reactionKey,
                "customThumbnail": resPost.data()!.thumbnail_custom,
                "userId": userId,
                "secretKey": process.env.FIREBASE_FUNCTIONS_KEY
            }
        }),
    });
    const j = await res.json()
    console.log(j);

    if (!res.ok) return NextResponse.json({ uid: null }, { status: 500 })

    return NextResponse.json({ message: "Done" })
}

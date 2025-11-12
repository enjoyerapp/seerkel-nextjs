import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/firebaseAdmin"

export async function POST(req: NextRequest) {    
    const { postId, commentId } = await req.json()
    let userId: string | null = null

    const token = req.cookies.get("token")?.value

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
            userId = decoded.uid
        } catch (e) {
            console.log(e);
            return NextResponse.json({ uid: null }, { status: 401 })
        }
    } else {
        return NextResponse.json({ uid: null }, { status: 401 })
    }

    const resPost = await db.collection("posts").doc(postId).get()
    const partnerId = resPost.data()!.user_id
    const resPartner = await db.collection("users").doc(partnerId).get()
    const partnerData = resPartner.data()!
    const resUser = await db.collection("users").doc(userId).get()
    const userData = resUser.data()!
    const resComment = await db.collection("posts").doc(postId).collection("comments").doc(commentId).get()
    var commentText = resComment.data()!.text
    if (commentText.includes("giphy.com")) {
        commentText = ""
    }

    const res = await fetch("https://us-central1-enjoyer-fa76d.cloudfunctions.net/likeCommentReply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: {
                "postId": postId,
                "commentId": commentId,
                "replyId": null,
                "commentText": commentText,
                "partnerName": partnerData.name,
                "partnerId": partnerId,
                "userName": userData.name,
                "userId": userId,
                "fcmToken": partnerData.fcm_token,
                "language": partnerData.language ?? "en",
                "userPic": userData.photo_url ?? "",
                "collection": "posts",
                "secretKey": process.env.FIREBASE_FUNCTIONS_KEY
            }
        }),
    });

    if (!res.ok) return NextResponse.json({ uid: null }, { status: 500 })

    return NextResponse.json({ message: "Done" })
}
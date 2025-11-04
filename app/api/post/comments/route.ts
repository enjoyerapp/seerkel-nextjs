import { algoliaClient } from "@/algoliaClient";
import { db } from "@/firebaseAdmin";
import { Comment } from "@/models/comment";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { FieldValue } from "firebase-admin/firestore";


export async function POST(req: NextRequest) {
    const { postId } = await req.json()

    const resComments = await db.collection("posts").doc(postId).collection("comments").orderBy("created_at", "desc").limit(20).get()

    const comments = resComments.docs.map((e) => {
        const data = e.data() as Comment;
        return {
            ...data,
            created_at: e.data().created_at?.toDate().toISOString()
        }
    })

    const userIds = comments.map((e) => e.uid!)

    const { results: userResults } = await algoliaClient.getObjects({
        requests: userIds.map(id => {
            return {
                indexName: "prod_USERS",
                objectID: id,
                attributesToRetrieve: ["id", "username", "name", "photo_url"]
            }
        })
    })

    // 6️⃣ Map users to dictionary for quick lookup
    const users: Record<string, User> = {};
    userResults?.forEach((u: any) => {
        if (u) users[u.id] = {
            id: u.id,
            username: u.username,
            name: u.name,
            photo_url: u.photo_url,
        } as User;
    });

    for (let index = 0; index < comments.length; index++) {
        const element = comments[index];
        element.user = users[element.uid!]
    }

    return Response.json({ comments })
}

export async function PUT(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ uid: null }, { status: 401 })
    const { postId, text } = await req.json()

    if ((text as string).length > 250) {
        return NextResponse.json({ uid: null }, { status: 406 })
    }

    var uid: string

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
        uid = decoded.uid
    } catch (e) {
        return NextResponse.json({ uid: null }, { status: 401 })
    }

    const batch = db.batch();

    const postRef = db.collection("posts").doc(postId);
    const commentRef = postRef.collection("comments").doc();

    batch.set(commentRef, {
        text: text.trim(),
        uid: uid,
        created_at: FieldValue.serverTimestamp(),
    });

    batch.update(postRef, {
        comment_count: FieldValue.increment(1),
    });

    await batch.commit();
    return NextResponse.json({ message: "Done" })
}

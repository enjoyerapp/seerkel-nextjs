export const dynamic = 'force-static';
import { db } from "@/firebaseAdmin"; // use admin SDK
import { Post } from "@/models/post";


export async function POST(request: Request) {
    const { } = await request.json();

    try {
        // 1️⃣ Get latest 20 posts
        const postsSnap = await db
            .collection("posts")
            .orderBy("created_at", "desc")
            .limit(20)
            .get();

        const posts: Post[] = postsSnap.docs.map((doc, index) => ({
            id: doc.id,
            ...doc.data(),
            isMuted: true,
            isPlaying: index == 0,
        } as Post));

        // 2️⃣ Get unique user IDs
        const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];

        // 3️⃣ Get all users (Admin SDK allows querying with array of IDs safely)
        const usersSnap = await db
            .collection("users")
            .where("__name__", "in", userIds)
            .get();

        const users: Record<string, any> = {};
        usersSnap.forEach(doc => {
            users[doc.id] = { id: doc.id, ...doc.data() };
        });

        // 4️⃣ Merge user data into posts
        const postsWithUsers = posts.map(post => ({
            ...post,
            user: users[post.user_id] || null,
        }));

        // 5️⃣ Return
        return Response.json({ posts: postsWithUsers });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

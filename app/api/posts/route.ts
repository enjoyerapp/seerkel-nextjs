import { algoliaClient } from "@/algoliaClient";
import { Post } from "@/models/post";
import { db } from "@/firebaseAdmin";
import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
    const { query, indexName, filters } = await req.json()
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

    try {
        const { hits: postHits } = await algoliaClient.searchSingleIndex({
            indexName: indexName ?? "prod_POSTS_by_popularity",
            searchParams: {
                hitsPerPage: 20,
                attributesToRetrieve: ["id", "description", "location", "like_count", "comment_count", "save_count", "share_count", "user_id", "thumbnail_custom"],
                query: query,
                filters: filters,
            },
        })

        const userIds = [...new Set(postHits.map((p) => (p as unknown as Post).user_id).filter(Boolean))];
        const postIds = [...new Set(postHits.map((p) => (p as unknown as Post).id).filter(Boolean))];


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
        const users: Record<string, any> = {};
        userResults?.forEach((u: any) => {
            if (u) users[u.id] = {
                id: u.id,
                username: u.username,
                name: u.name,
                photo_url: u.photo_url,
            };
        });

        const postReactions: Record<string, string | null> = {};

        if (userId) {
            const res = await db.getAll(...postIds.map((e) => db.collection("posts").doc(e).collection("likes").doc(userId)))
            res.forEach((e, i) => {
                if (e.exists) {
                    postReactions[postIds[i]] = e.data()?.reaction_key
                } else {
                    postReactions[e.id] = null
                }
            })
        }

        const postsWithUsers = postHits.map((postRaw, index): Post => {
            const post = postRaw as unknown as Post;
            return {
                ...post,
                isMuted: false,
                isPlaying: index === 0,
                user: users[post.user_id] || null,
                myReaction: postReactions[post.id]
            };
        });

        console.log(postIds[0]);
        
        
        return Response.json({ posts: postsWithUsers });
    } catch (error: any) {
        console.error("Algolia fetch failed:", error);
        return Response.json({ error: "Failed to fetch from Algolia" }, { status: 500 });
    }
}

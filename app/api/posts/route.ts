import { algoliaClient } from "@/algoliaClient";
import { Post } from "@/models/post";

export const dynamic = 'force-static';

export async function POST(request: Request) {
    const { query, indexName, filters } = await request.json()
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

        const postsWithUsers = postHits.map((post, index) => ({
            ...post,
            isMuted: false,
            isPlaying: index == 0,
            user: users[(post as unknown as Post).user_id] || null,
        }));

        return Response.json({ posts: postsWithUsers });
    } catch (error: any) {
        console.error("Algolia fetch failed:", error);
        return Response.json({ error: "Failed to fetch from Algolia" }, { status: 500 });
    }
}

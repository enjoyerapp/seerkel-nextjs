import { algoliaClient } from "@/algoliaClient";
import { Post } from "@/models/post";
import { db } from "@/firebaseAdmin";
import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { shuffleArray } from "@/helpers/helpers";

export async function POST(req: NextRequest) {
    const { query, indexName, filters, postId, isHome, customId, createdAfter } = await req.json()
    let userId: string | null = customId

    const token = req.cookies.get("token")?.value

    if (token && !customId) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string }
            userId = decoded.uid
        } catch (e) {
            console.log(e);
        }
    }

    const isHomeFeed = (isHome && userId)

    let postHits: Post[] = []
    let latLng: string | undefined

    if (isHome && userId) {
        const resSecret = await db.collection("userSecrets").doc(userId).get()
        const resSecretData = resSecret.data()
        var watchedPostIds: string[] = []

        try {
            const resWatchedPosts = await algoliaClient.getObject({ indexName: "prod_WATCHED_POSTS", objectID: userId })
            watchedPostIds = (resWatchedPosts["watchedPostIds"] as string[] | undefined | null) ?? []
        } catch (error) {
            console.log(error);
        }

        if (resSecretData?.show_followed_content_in_feed ?? false) {
            const f =
                resSecretData!.followees.map((e: any) => `user_id:${e}`).join(" OR ");

            var customFilters = []
            if (f) {
                if (f.includes("OR")) {
                    customFilters.push(`(${f})`);
                } else {
                    customFilters.push(f);
                }
            }

            if (watchedPostIds.length > 0) {
                customFilters = [...customFilters, ...(watchedPostIds.map((e) => `NOT objectID:${e}`))]
            }

            const newPosts = await fetchPosts({
                indexName: "prod_POSTS_by_recency",
                query: undefined,
                filters: customFilters.join(" AND "),
                aroundLatLng: undefined,
            })
            postHits = [...newPosts, ...postHits]
        } else {
            let orderList = [2, 3, 4, 5];
            orderList = shuffleArray(orderList)
            orderList = [6, 1, ...orderList]

            for (let index = 0; index < orderList.length; index++) {
                const element = orderList[index];

                if (element == 1 && postHits.length < 20) {
                    const f =
                        resSecretData!.followees?.map((e: any) => `user_id:${e}`).join(" OR ");
                    if (f == undefined || f == null) continue;
                    var customFilters = []
                    if (f.includes("OR")) {
                        customFilters.push(`(${f})`);
                    } else {
                        customFilters.push(f);
                    }

                    if (watchedPostIds.length > 0) {
                        customFilters = [...customFilters, ...(watchedPostIds.map((e) => `NOT objectID:${e}`))]
                    }

                    const newPosts = await fetchPosts({
                        indexName: "prod_POSTS_by_recency",
                        query: undefined,
                        filters: customFilters.join(" AND "),
                        aroundLatLng: undefined,
                    })
                    postHits = [...newPosts, ...postHits]
                }
                else if (element == 2 && postHits.length < 20) {
                    const resUser = await db.collection("users").doc(userId).get()
                    const resUserdata = resUser.data()
                    const userSearches = resUserdata?.last_searches as string[] | undefined | null
                    const searchesWithoutUsers = userSearches?.filter((e) => !e.startsWith("@"))
                    const userLocation = resUserdata?.location;

                    if (searchesWithoutUsers && searchesWithoutUsers!.length > 0) {
                        const newPosts = await fetchPosts({
                            indexName: "prod_POSTS_by_recency",
                            query: searchesWithoutUsers[0],
                            filters: watchedPostIds.map((e) => `NOT objectID:${e}`).join(" AND "),
                            aroundLatLng: undefined,
                        })
                        postHits = [...newPosts, ...postHits]

                        if (searchesWithoutUsers.length > 1) {
                            const newPosts = await fetchPosts({
                                indexName: "prod_POSTS_by_recency",
                                query: searchesWithoutUsers[1],
                                filters: undefined,
                                aroundLatLng: undefined,
                            })
                            postHits = [...newPosts, ...postHits]
                        }
                    } else if (userLocation) {
                        latLng = `${userLocation.latitude},${userLocation.longitude}`
                        const newPosts = await fetchPosts({
                            indexName: "prod_POSTS_by_recency",
                            query: undefined,
                            filters: watchedPostIds.map((e) => `NOT objectID:${e}`).join(" AND "),
                            aroundLatLng: latLng,
                        })
                        postHits = [...newPosts, ...postHits]
                    }
                }
                else if ((element == 3 || element == 4) && postHits.length < 20) {
                    const resUser = await db.collection("users").doc(userId).get()
                    const resUserdata = resUser.data()
                    const userLocation = resUserdata?.location;

                    if (userLocation) {
                        latLng = `${userLocation.latitude},${userLocation.longitude}`
                        const newPosts = await fetchPosts({
                            indexName: "prod_POSTS_by_recency",
                            query: undefined,
                            filters: watchedPostIds.map((e) => `NOT objectID:${e}`).join(" AND "),
                            aroundLatLng: latLng,
                            aroundRadius: 20000,
                        })
                        postHits = [...newPosts, ...postHits]
                    }
                } else if (element == 6 && postHits.length < 20) {
                    const f =
                        resSecretData!.favorite_users?.map((e: any) => `user_id:${e}`).join(" OR ");
                    if (f == undefined || f == null) continue;
                    var customFilters = []
                    if (f.includes("OR")) {
                        customFilters.push(`(${f})`);
                    } else {
                        customFilters.push(f);
                    }

                    if (watchedPostIds.length > 0) {
                        customFilters = [...customFilters, ...(watchedPostIds.map((e) => `NOT objectID:${e}`))]
                    }

                    const newPosts = await fetchPosts({
                        indexName: "prod_POSTS_by_recency",
                        query: undefined,
                        filters: customFilters.join(" AND "),
                        aroundLatLng: undefined,
                    })
                    postHits = [...newPosts, ...postHits]
                }
            }
        }
    }

    try {
        if (!isHomeFeed) {
            var f: string[] = []
            if (customId) {
                f.push(`user_id:${customId}`)
            }

            postHits = await fetchPosts({
                indexName: indexName ?? "prod_POSTS_by_popularity",
                query: query,
                filters: filters ?? f.join(" AND "),
                aroundLatLng: latLng,
                numericFilters: createdAfter ? `created_at_unix < ${createdAfter}` : ""
            })
        }

        postHits = Array.from(
            new Map(postHits.map(post => [post.id, post])).values()
        );

        if (postId) {
            const res = await db.collection("posts").doc(postId).get()
            if (res.exists) {
                postHits = [res.data()! as Post, ...postHits]
            }
        }

        const userIds = [...new Set(postHits.map((p) => (p).user_id).filter(Boolean))];
        const postIds = [...new Set(postHits.map((p) => (p).id).filter(Boolean))];


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

        if (userId && postIds.length > 0) {
            const res = await db.getAll(...postIds.map((e) => db.collection("posts").doc(e).collection("likes").doc(userId)))
            res.forEach((e, i) => {
                if (e.exists) {
                    postReactions[postIds[i]] = e.data()?.reaction_key
                } else {
                    postReactions[e.id] = null
                }
            })
        }

        const postsWithUsers = postHits.map((post, index): Post => {
            return {
                ...post,
                isMuted: false,
                isPlaying: index === 0,
                user: users[post.user_id] || null,
                myReaction: postReactions[post.id]
            };
        });

        return Response.json({ posts: postsWithUsers });
    } catch (error: any) {
        console.error("Algolia fetch failed:", error);
        return Response.json({ error: "Failed to fetch from Algolia" }, { status: 500 });
    }
}

interface FetchPostInterface {
    indexName: string;
    query: string | undefined;
    filters: string | undefined;
    numericFilters?: string | undefined;
    aroundLatLng?: string | undefined;
    aroundRadius?: number | undefined;
}

async function fetchPosts(val: FetchPostInterface) {    
    let { hits: postHits } = await algoliaClient.searchSingleIndex({
        indexName: val.indexName,
        searchParams: {
            hitsPerPage: 20,
            attributesToRetrieve: ["id", "description", "location", "like_count", "comment_count", "save_count", "share_count", "user_id", "thumbnail_custom","created_at_unix","created_at"],
            query: val.query,
            filters: val.filters,
            numericFilters: val.numericFilters,
            aroundLatLng: val.aroundLatLng ?? undefined,
            aroundRadius: val.aroundRadius ?? 6000
        },
    })

    return postHits.map((e) => e as unknown as Post)
}
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { db } from "@/firebaseAdmin";
import { firestore } from "firebase-admin";
import { algoliaClient } from "@/algoliaClient";


export async function POST(req: NextRequest) {
    const { postId, watchPercentage, watchTime } = await req.json()

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

    try {
        // Get post data
        const postRef = db.collection("posts").doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const post = postDoc.data();
        const postOwnerId = post?.user_id;

        // Don't track views for own posts
        if (postOwnerId === userId) {
            return NextResponse.json({ success: true, message: "Own post view not tracked" });
        }

        var isPostWatched = false

        try {
            const resWatchedPosts = await algoliaClient.getObject({ indexName: "prod_WATCHED_POSTS", objectID: userId })
            let watchedPostIds = (resWatchedPosts["watchedPostIds"] as string[] | undefined | null) ?? []

            if (watchedPostIds.includes(postId)) {
                isPostWatched = true
            } else {
                watchedPostIds = [postId, ...watchedPostIds]
                await algoliaClient.partialUpdateObject({
                    indexName: "prod_WATCHED_POSTS", objectID: userId, attributesToUpdate: {
                        watchedPostIds: watchedPostIds.slice(0, 960),
                    }, createIfNotExists: true
                })
            }
        } catch (error) {
            console.log(error);
        }

        // Check if member
        const memberDocId = `${postOwnerId}${userId}`;
        const memberDoc = await db
            .collection("members")
            .doc(memberDocId)
            .get();

        const isMember = memberDoc.exists;

        // Check if follower
        let isFollower = false;
        if (!isMember) {
            const ids = [postOwnerId, userId].sort();
            const followDoc = await db
                .collection("follows")
                .doc(ids.join(""))
                .get();

            if (followDoc.exists && followDoc.data()?.[userId] === 2) {
                isFollower = true;
            }
        }

        // Prepare post update data
        const dataPosts: any = {
            view_count: firestore.FieldValue.increment(1),
            watched_length_seconds: firestore.FieldValue.increment(watchTime),
        };

        if (watchPercentage >= 50 && watchPercentage < 75) {
            dataPosts.watched_50_percent = firestore.FieldValue.increment(1);
        } else if (watchPercentage >= 75 && watchPercentage < 90) {
            dataPosts.watched_75_percent = firestore.FieldValue.increment(1);
        } else if (watchPercentage >= 90) {
            dataPosts.watched_90_percent = firestore.FieldValue.increment(1);
        }


        if (!isPostWatched) {
            dataPosts.unique_view_count = firestore.FieldValue.increment(1);
        }

        // Update posts collection
        await postRef.update(dataPosts);

        
        if (post?.video_length_seconds != null) {
            await updateRetention(postId);
        }

        // Update userStats with transaction
        const userStatsRef = db.collection("userStats").doc(postOwnerId);
        await db.runTransaction(async (transaction) => {
            const userStatsDoc = await transaction.get(userStatsRef);
            const watchedVideos = (userStatsDoc.data()?.watched_videos || []) as string[];

            const map: any = { ...dataPosts };

            if (watchPercentage >= 90) {
                watchedVideos.unshift(postId);
                map.watched_videos = watchedVideos.slice(0, 50);
            }

            transaction.update(userStatsRef, map);
        });

        // Determine view key
        let viewKey = "views_user";
        if (isMember) {
            viewKey = "views_member";
        } else if (isFollower) {
            viewKey = "views_follower";
        }

        // Get current date formatted
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Update stats subcollection
        const statsData: any = {
            [viewKey]: firestore.FieldValue.increment(1),
            timestamp: firestore.FieldValue.serverTimestamp(),
            views_home: firestore.FieldValue.increment(1),
        };

        await postRef
            .collection("stats")
            .doc(currentDate)
            .set(statsData, { merge: true });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error tracking view:", error);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
    }
}

async function updateRetention(postId: string) {
    const postRef = db.collection("posts").doc(postId);

    try {
        await db.runTransaction(async (transaction) => {
            try {
                const snapshot = await transaction.get(postRef);

                if (!snapshot.exists) {
                    return;
                }

                const post = snapshot.data();
                const watchedLengthSeconds = post?.watched_length_seconds ?? 0;
                const uniqueViewCount = post?.unique_view_count ?? 0;
                const videoLengthSeconds = post?.video_length_seconds ?? 0;

                // Avoid division by zero
                if (uniqueViewCount === 0 || videoLengthSeconds === 0) {
                    return;
                }

                const rate = (watchedLengthSeconds / (uniqueViewCount * videoLengthSeconds)) * 100;

                transaction.update(postRef, { retention_rate: rate });
            } catch (error) {
                // Silent catch like in Flutter version
                console.error("Error in transaction:", error);
            }
        });
    } catch (error) {
        console.error("Error updating document:", error);
    }
}
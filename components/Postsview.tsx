'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    Volume2,
    VolumeX,
    LocateIcon,
    X,
    Send,
} from 'lucide-react';
import { Post } from '@/models/post';
import HlsVideo from '@/components/HlsVideo';
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"
import { Comment } from '@/models/comment';
import { timeAgo } from '@/helpers/helpers';

interface PostsViewProps {
    posts: Post[];
    initialIndex?: number;
}

export default function PostsView({ posts, initialIndex = 0 }: PostsViewProps) {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(initialIndex);
    const [isMuted, setIsMuted] = useState(true);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartY = useRef(0);
    const scrollAccumulator = useRef(0);
    const [postsState, setPostsState] = useState<Post[]>(posts);
    const [postComments, setPostComments] = useState<Comment[] | null>(null);
    const { user } = useUser()

    // Update posts state when props change
    useEffect(() => {
        setPostsState(posts);
    }, [posts]);

    // Set initial video index and scroll to it on mount
    useEffect(() => {
        setCurrentVideoIndex(initialIndex);
        // Small delay to ensure container is rendered
        setTimeout(() => {
            scrollToVideo(initialIndex);
        }, 100);
    }, [initialIndex]);

    // Play current video when index changes
    useEffect(() => {
        const newPosts = postsState.map((post, index) => {
            if (index === currentVideoIndex) {
                return { ...post, isPlaying: true };
            }
            return { ...post, isPlaying: false };
        });
        setPostsState(newPosts);
        setIsCommentsOpen(false);
        setPostComments(null)
    }, [currentVideoIndex]);


    // Smooth scroll to video
    const scrollToVideo = (index: number) => {
        if (containerRef.current) {
            const container = containerRef.current;
            const targetScroll = index * container.clientHeight;

            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    // Handle wheel scroll with accumulation and momentum
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        if (isScrolling) return;

        scrollAccumulator.current += e.deltaY;

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Set new timeout to trigger page change
        scrollTimeoutRef.current = setTimeout(() => {
            const threshold = 50; // Minimum scroll amount to trigger page change

            if (Math.abs(scrollAccumulator.current) > threshold) {
                if (scrollAccumulator.current > 0 && currentVideoIndex < postsState.length - 1) {
                    // Scroll down
                    setIsScrolling(true);
                    setCurrentVideoIndex(prev => prev + 1);
                    setTimeout(() => setIsScrolling(false), 800);
                } else if (scrollAccumulator.current < 0 && currentVideoIndex > 0) {
                    // Scroll up
                    setIsScrolling(true);
                    setCurrentVideoIndex(prev => prev - 1);
                    setTimeout(() => setIsScrolling(false), 800);
                }
            }

            scrollAccumulator.current = 0;
        }, 50);
    };

    // Handle touch events for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (isScrolling) return;

        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentVideoIndex < postsState.length - 1) {
                // Swipe up - next video
                setIsScrolling(true);
                setCurrentVideoIndex(prev => prev + 1);
                setTimeout(() => setIsScrolling(false), 800);
            } else if (diff < 0 && currentVideoIndex > 0) {
                // Swipe down - previous video
                setIsScrolling(true);
                setCurrentVideoIndex(prev => prev - 1);
                setTimeout(() => setIsScrolling(false), 800);
            }
        }
    };

    // Scroll to current video when index changes
    useEffect(() => {
        scrollToVideo(currentVideoIndex);
    }, [currentVideoIndex]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleComments = async () => {
        const isOpened = isCommentsOpen
        setIsCommentsOpen(!isCommentsOpen);
        if (!isOpened && postComments == null) {
            const res = await fetch("/api/post/comments", {
                method: "POST",
                body: JSON.stringify({
                    "postId": posts[currentVideoIndex].id
                })
            })
            const { comments } = await res.json()
            setPostComments(comments)
        }
    };

    const navigateToVideo = (index: number) => {
        if (!isScrolling && index >= 0 && index < postsState.length) {
            setIsScrolling(true);
            setCurrentVideoIndex(index);
            setTimeout(() => setIsScrolling(false), 800);
        }
    };

    async function handleLike(post: Post) {
        if (user == null) {
            toast.warning("Please login to leave a reaction")
            return
        }
        setPostsState(prevPosts =>
            prevPosts.map(postMap =>
                postMap.id === post.id ? { ...postMap, myReaction: (post.myReaction ? null : "like_it"), like_count: (post.myReaction ? post.like_count-- : post.like_count++) } : postMap
            )
        )
        const res = await fetch("/api/post/like", {
            method: "POST",
            body: JSON.stringify({ postId: post.id, reactionKey: "like_it", isLike: post.myReaction == null })
        })

        if (res.ok) return
        setPostsState(prevPosts =>
            prevPosts.map(postMap =>
                postMap.id === post.id ? { ...postMap, myReaction: post.myReaction, like_count: (post.myReaction ? post.like_count-- : post.like_count++) } : postMap
            )
        )
        toast.error("Error trying to leave reaction")
    }

    async function handleCommentLike(isLike: boolean, index: number, commentId: string) {
        setPostComments(prevComments => prevComments!.map((commentMap, indexMap) => indexMap == index ?
            (!isLike ? { ...commentMap, myLikeId: null, like_count: (commentMap.like_count ?? 0) - 1 } : { ...commentMap, myLikeId: user!.id, like_count: (commentMap.like_count ?? 0) + 1 }) : commentMap))
        await fetch("/api/post/comments/like", {
            method: "POST",
            body: JSON.stringify({ postId: posts[currentVideoIndex].id, commentId: commentId })
        })
    }

    const handleSubmitComment = async () => {
        if (!user) {
            toast.warning("Please login to comment");
            return;
        }
        if (!commentText.trim()) return;
        const text = commentText.trim()
        setCommentText('');

        setPostComments((e) => {
            return [
                ({
                    created_at: (new Date()).toISOString(),
                    is_liked: false,
                    is_member: false,
                    like_count: 0,
                    reply_count: 0,
                    text: text,
                    uid: user.id,
                    user: user,
                } as Comment),
                ...(e ?? [])
            ]
        })

        await fetch("/api/post/comments", {
            method: "PUT",
            body: JSON.stringify({
                postId: currentPost.id,
                text: text,
            })
        })
    };

    if (postsState.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-white">
                <p>No posts available</p>
            </div>
        );
    }

    const currentPost = postsState[currentVideoIndex];

    return (
        <div className="relative h-full w-full">
            {/* Main Content Area - Scroll Container */}
            <div
                ref={containerRef}
                className="h-full w-full relative overflow-y-scroll scroll-smooth snap-y snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Hide scrollbar */}
                <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

                {/* Render all videos */}
                {postsState.map((post, index) => (
                    <div
                        key={post.id}
                        className="h-full w-full snap-start snap-always flex items-center justify-center relative"
                    >
                        {/* Video Container */}
                        <div className="relative w-full max-w-[500px] h-full bg-black flex items-center justify-center">
                            {/* Video */}
                            <HlsVideo
                                src={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN}/${post.id}/playlist.m3u8`}
                                loop
                                muted={isMuted}
                                isPlaying={post.isPlaying}
                            />

                            {/* Mute/Unmute Button */}
                            <button
                                onClick={toggleMute}
                                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition z-10"
                            >
                                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>

                            {/* Video Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-10">
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-2 overflow-hidden">
                                        <img src={post.user.photo_url ?? ""} alt="avatar" className="w-full h-full" />
                                    </div>
                                    <span className="font-bold">{post.user.username}</span>
                                </div>
                                <p className="text-sm mb-2">{post.description}</p>
                                <div className="flex items-center text-sm">
                                    <LocateIcon className="w-4 h-4 mr-1" />
                                    <span className="mr-4">{post.location.formattedAddress}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-4 z-10 pb-20">
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleLike(post)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${post.myReaction ? 'bg-red-500' : 'bg-gray-800/70 hover:bg-gray-700'
                                            }`}
                                    >
                                        <Heart className={`w-7 h-7 transition-all ${post.myReaction ? 'fill-white scale-110' : ''}`} />
                                    </button>
                                    <span className="text-xs mt-1 font-semibold">{post.like_count}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={toggleComments}
                                        className="w-12 h-12 bg-gray-800/70 rounded-full hover:bg-gray-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                                    >
                                        <MessageCircle className="w-7 h-7" />
                                    </button>
                                    <span className="text-xs mt-1 font-semibold">{post.comment_count}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => { }}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${post.isSaved ? 'bg-yellow-500' : 'bg-gray-800/70 hover:bg-gray-700'
                                            }`}
                                    >
                                        <Bookmark className={`w-7 h-7 transition-all ${post.isSaved ? 'fill-white scale-110' : ''}`} />
                                    </button>
                                    <span className="text-xs mt-1 font-semibold">{post.save_count}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button className="w-12 h-12 bg-gray-800/70 rounded-full hover:bg-gray-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                                        <Share2 className="w-7 h-7" />
                                    </button>
                                    <span className="text-xs mt-1 font-semibold">{post.share_count}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comments Section - Sliding Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-black/95 backdrop-blur-sm z-50 transform transition-transform duration-300 ease-in-out ${isCommentsOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Comments Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold">Comments</h2>
                    <button
                        onClick={toggleComments}
                        className="p-2 hover:bg-gray-800 rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
                    {(postComments && postComments.length > 0) ? (
                        postComments!.map((c, i) =>
                            <div className="flex space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                    <img src={c.user?.photo_url ?? ""} alt="user" className="w-full h-full" />
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-800 rounded-lg p-3">
                                        <p className="font-semibold text-sm">{c.user?.username}</p>
                                        <p className="text-sm mt-1">{c.text ?? ""}</p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                        <button onClick={() => handleCommentLike(c.myLikeId == null, i, c.id!)} className='flex items-center space-x-1 cursor-pointer hover:text-white'>
                                            <Heart className={`w-3 h-3 transition-all text-red-500 ${c.myLikeId ? 'fill-red-500 scale-110' : ''}`} />
                                            <p>Like ({c.like_count ?? 0})</p>
                                        </button>
                                        <button className="hover:text-white">Reply ({c.reply_count ?? 0})</button>
                                        {c.created_at && <span>{timeAgo(new Date(c.created_at!))}</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageCircle className="w-12 h-12 mb-2" />
                            <p>No comments yet</p>
                            <p className="text-sm">Be the first to comment!</p>
                        </div>
                    )}
                </div>

                {/* Comment Input */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-black">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                            {user && user.photo_url && (
                                <img src={user.photo_url} alt="you" className="w-full h-full" />
                            )}
                        </div>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => {
                                if (e.target.value.length <= 250) {
                                    setCommentText(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                            placeholder="Add a comment..."
                            className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim()}
                            className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay backdrop when comments are open */}
            {isCommentsOpen && (
                <div
                    onClick={toggleComments}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                />
            )}

            {/* Scroll Indicators - Arrow Navigation */}
            <div className="hidden md:flex md:absolute md:right-8 md:top-1/2 md:transform md:-translate-y-1/2 md:flex-col md:space-y-4 md:z-20">
                <button
                    onClick={() => navigateToVideo(currentVideoIndex - 1)}
                    className={`w-10 h-10 rounded-full bg-black/50 flex items-center justify-center transition-all duration-300 ${currentVideoIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 hover:scale-110'
                        }`}
                    disabled={currentVideoIndex === 0 || isScrolling}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>

                <button
                    onClick={() => navigateToVideo(currentVideoIndex + 1)}
                    className={`w-10 h-10 rounded-full bg-black/50 flex items-center justify-center transition-all duration-300 ${currentVideoIndex === postsState.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 hover:scale-110'
                        }`}
                    disabled={currentVideoIndex === postsState.length - 1 || isScrolling}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
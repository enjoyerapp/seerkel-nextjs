'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Grid, Heart, MessageCircle, Share2 } from 'lucide-react';
import { User } from '@/models/user';
import FilledButton from '@/components/FilledButton';
import { Post } from '@/models/post';
import { toast } from 'sonner';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'saved'>('posts');
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    async function load(createdAfter?: string) {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        const params = new URLSearchParams(window.location.search);
        const username = params.get('username')
        const res = await fetch(username ? `/api/user?u=${username}` : "/api/user")
        if (!res.ok) {
            return
        }
        const data = await res.json()
        setUser(data.user)
        setIsLoading(false)

        const resFetch = await fetch("/api/posts", { method: "POST", body: JSON.stringify({ indexName: "prod_POSTS_by_recency", isHome: false, customId: data.user!.id!, createdAfter: createdAfter }) });
        const { posts } = await resFetch.json()

        setPosts((e) => [...e, ...posts])
        setIsLoadingMore(false);
        setHasMore(posts.length > 0)
    }

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {            
            if (isLoadingMore || !hasMore) return;

            const scrollTop = scrollElement.scrollTop;
            const scrollHeight = scrollElement.scrollHeight;
            const clientHeight = scrollElement.clientHeight;

            // Load more when user is 200px from bottom
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                const lastPost = posts[posts.length - 1];
                if (lastPost) {
                    console.log('Loading more posts...');
                    load(lastPost.created_at_unix!);
                }
            }
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMore, posts]);

    useEffect(() => {
        load()
    }, [])

    return (
        <div ref={scrollRef} className="w-full h-full overflow-y-auto bg-black text-white">
            {isLoading ? (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Loading profile...</p>
                    </div>
                </div>
            ) : <>
                <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900 to-blue-900">
                    {user!.profile_cover && <img src={user!.profile_cover!} alt="cover" className='w-full h-full' />}
                </div>
                <div className="max-w-5xl mx-auto px-4 -mt-16 md:-mt-20">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                        {/* Avatar */}
                        <div className="relative">
                            {user!.photo_url ? <img src={user!.photo_url!} alt="avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-gray-800 overflow-hidden" />
                                :
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-gray-800 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-[#FBDF85] to-yellow-600">
                                        {user!.name.charAt(0)}
                                    </div>
                                </div>
                            }
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 md:mt-0 flex gap-3">
                            {!user!.isOwnProfile && <FilledButton children={<p>Follow</p>} ></FilledButton>}
                            <button
                                onClick={(e) => {
                                    navigator.clipboard.writeText(`Meet people, meet fun with Seerkel\n\n${window.location}`);
                                    toast.success("Link copied!")
                                }}
                                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-4">
                        <h1 className="text-2xl md:text-3xl font-bold">{user!.name}</h1>
                        <p className="text-gray-400 mt-1">@{user!.username}</p>
                        <p className="mt-3 text-gray-300 max-w-2xl">{user!.bio}</p>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 flex gap-6 md:gap-8 text-sm md:text-base">
                        {/* <div>
                            <span className="font-bold text-lg">{user!.pots}</span>
                            <span className="text-gray-400 ml-1">Gönderi</span>
                        </div> */}
                        <button className="hover:text-gray-300 transition">
                            <span className="font-bold text-lg">{user!.follower_count ?? 0}</span>
                            <span className="text-gray-400 ml-1">Takipçi</span>
                        </button>
                        <button className="hover:text-gray-300 transition">
                            <span className="font-bold text-lg">{user!.followee_count ?? 0}</span>
                            <span className="text-gray-400 ml-1">Takip</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8 border-t border-gray-800">
                        <div className="flex justify-center gap-8 md:gap-16">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex items-center gap-2 py-4 border-t-2 transition ${activeTab === 'posts'
                                    ? 'border-[#FBDF85] text-[#FBDF85]'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                                <span className="hidden md:inline font-medium">GÖNDERİLER</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="mt-1 pb-12">
                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
                                    >
                                        {/* Placeholder for post image */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900">
                                            <img src={post.thumbnail_custom ?? `https://${process.env.NEXT_PUBLIC_BUNNY_CDN}/${post.id}/thumbnail.jpg`} alt="thumbnail" />
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 md:gap-6">
                                            <div className="flex items-center gap-2 text-white">
                                                <Heart className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                                                <span className="font-bold text-sm md:text-base">{post.like_count}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white">
                                                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                                                <span className="font-bold text-sm md:text-base">{post.comment_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(posts.length === 0) && (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-gray-800 flex items-center justify-center">
                                    {activeTab === 'posts' && <Grid className="w-10 h-10 text-gray-600" />}
                                </div>
                                <h3 className="text-xl font-bold mb-2">Henüz içerik yok</h3>
                                <p className="text-gray-400">
                                    {activeTab === 'posts' && 'Henüz gönderi paylaşılmadı'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </>}
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingUp, Hash, Music, X, Play, Heart } from 'lucide-react';
import { Post } from '@/models/post';

interface VideoResult {
    id: number;
    thumbnail: string;
    username: string;
    userAvatar: string;
    description: string;
    likes: string;
    views: string;
}

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [postsRef, setPostsRef] = useState<Post[]>([]);
    const [trendSearches, setTrendSearches] = useState<string[]>([]);

    const popularHashtags = [
        '#fyp',
        '#viral',
        '#trending',
        '#foryou',
        '#funny',
        '#dance',
        '#music',
        '#cooking',
    ];

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/search-page")
            const { searches } = await res.json()

            setTrendSearches(searches)
        }

        load()
    }, [])

    const handleClearSearch = () => {
        setSearchQuery('');
        setPostsRef([])
    };

    async function search(customQuery?: string) {
        const query = customQuery ?? searchQuery.trim()
        if (query == "") return
        const resFetch = await fetch("/api/posts", { method: "POST", body: JSON.stringify({ query: query, indexName: "prod_POSTS" }) });
        const { posts } = await resFetch.json()

        setPostsRef(posts)
    }

    return (
        <>
            <div className="w-full h-full overflow-y-auto bg-black text-white">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Search Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-6">Search</h1>

                        {/* Search Input */}
                        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => {
                                    if (e.code == "Enter") {
                                        search()
                                    }
                                }}
                                placeholder="Search here.."
                                className="w-full bg-gray-900 text-white rounded-full py-3 pl-12 pr-12 focus:outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-gray-800 rounded-full p-1 transition"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Results or Trending Content */}
                    {searchQuery ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Results for "{searchQuery}"</h2>
                                <p className="text-gray-400 text-sm">{postsRef.length} posts found</p>
                            </div>

                            {/* Responsive Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-[12vw]">
                                {postsRef.map((post) => (
                                    <div
                                        key={post.id}
                                        className="group cursor-pointer"
                                    >
                                        {/* Video Card */}
                                        <div className="relative rounded-lg overflow-hidden bg-gray-900">
                                            {/* 9:16 Aspect Ratio Container */}
                                            <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
                                                {/* Thumbnail */}
                                                <img
                                                    src={post.thumbnail_custom ?? `https://${process.env.NEXT_PUBLIC_BUNNY_CDN}/${post.id}/thumbnail.jpg`}
                                                    alt={post.description}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />

                                                {/* Overlay on Hover */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

                                                {/* Play Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                                                        <Play className="w-8 h-8 text-black ml-1" fill="black" />
                                                    </div>
                                                </div>

                                                {/* Views Count */}
                                                <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-sm font-semibold">
                                                    <Play className="w-4 h-4" fill="white" />
                                                    <span>{post.view_count}</span>
                                                </div>

                                                {/* Likes Count */}
                                                <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-white text-sm font-semibold">
                                                    <Heart className="w-4 h-4" fill="white" />
                                                    <span>{post.like_count}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video Info */}
                                        <div className="mt-3 px-1">
                                            {/* User Info */}
                                            <div className="flex items-center space-x-2 mb-2">
                                                <img
                                                    src={post.user.photo_url ?? ""}
                                                    alt={post.user.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span className="text-sm font-semibold text-gray-300 hover:text-white transition">
                                                    {post.user.name}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition">
                                                {post.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Trending Searches */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-[#FBDF85] mr-2" />
                                    <h2 className="text-xl font-semibold">Trend searches</h2>
                                </div>
                                <div className="space-y-2">
                                    {trendSearches.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => {
                                                setSearchQuery(item)
                                                search(item)
                                            }}
                                            className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                    <Hash className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium group-hover:text-[#FBDF85] transition">{item}</p>
                                                </div>
                                            </div>
                                            <Search className="w-5 h-5 text-gray-600 group-hover:text-[#FBDF85] transition" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Hashtags */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <Hash className="w-6 h-6 text-[#FBDF85] mr-2" />
                                    <h2 className="text-xl font-semibold">Popular hashtags</h2>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {popularHashtags.map((tag, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSearchQuery(tag)}
                                            className="px-4 py-2 bg-gray-900 hover:text-black hover:bg-[#FBDF85] rounded-full transition-all duration-300 transform hover:scale-105"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Discover Categories */}
                            <div>
                                <div className="flex items-center mb-4">
                                    <Music className="w-6 h-6 text-[#FBDF85] mr-2" />
                                    <h2 className="text-xl font-semibold">Categories</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { name: 'Müzik', emoji: '🎵', color: 'from-purple-500 to-pink-500' },
                                        { name: 'Dans', emoji: '💃', color: 'from-[#FBDF85] to-orange-500' },
                                        { name: 'Komedi', emoji: '😂', color: 'from-yellow-500 to-[#FBDF85]' },
                                        { name: 'Spor', emoji: '⚽', color: 'from-green-500 to-blue-500' },
                                        { name: 'Yemek', emoji: '🍳', color: 'from-orange-500 to-[#FBDF85]' },
                                        { name: 'Seyahat', emoji: '✈️', color: 'from-blue-500 to-purple-500' },
                                    ].map((category, index) => (
                                        <button
                                            key={index}
                                            className={`relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br ${category.color} p-6 hover:scale-105 transition-transform duration-300 group`}
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                                            <div className="relative h-full flex flex-col items-center justify-center space-y-2">
                                                <span className="text-4xl">{category.emoji}</span>
                                                <span className="text-white font-semibold text-lg">{category.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
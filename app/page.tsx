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
  Download,
} from 'lucide-react';
import { Post } from '@/models/post';
import HlsVideo from '@/components/HlsVideo';

interface Video {
  id: number;
  username: string;
  description: string;
  videoUrl: string;
  likes: string;
  comments: number;
  bookmarks: number;
  shares: number;
  userAvatar: string;
}

export default function Home() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef(0);
  const scrollAccumulator = useRef(0);
  const [postsRef, setPostsRef] = useState<Post[]>([]);

  useEffect(() => {
    async function load() {
      const resFetch = await fetch("/api/posts", { method: "POST", body: JSON.stringify({ "Sa": "AS" }) });
      const { posts } = await resFetch.json()

      setPostsRef(posts)
    }

    load()
  }, [])

  // Play current video when index changes
  useEffect(() => {
    const newPosts = postsRef.map((post, index) => {
      if (index == currentVideoIndex) {
        return { ...post, isPlaying: true }
      }
      return { ...post, isPlaying: false }
    })
    setPostsRef(newPosts)
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
        if (scrollAccumulator.current > 0 && currentVideoIndex < postsRef.length - 1) {
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
      if (diff > 0 && currentVideoIndex < postsRef.length - 1) {
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

  const navigateToVideo = (index: number) => {
    if (!isScrolling && index >= 0 && index < postsRef.length) {
      setIsScrolling(true);
      setCurrentVideoIndex(index);
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Main Content Area - Scroll Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-y-scroll scroll-smooth snap-y snap-mandatory"
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
        {postsRef.map((post, index) => (
          <div
            key={post.id}
            className="h-screen w-full snap-start snap-always flex items-center justify-center relative"
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
                className="absolute top-4.5 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition z-10"
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
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${isLiked ? 'bg-red-500' : 'bg-gray-800/70 hover:bg-gray-700'
                      }`}
                  >
                    <Heart className={`w-7 h-7 transition-all ${isLiked ? 'fill-white scale-110' : ''}`} />
                  </button>
                  <span className="text-xs mt-1 font-semibold">{post.like_count}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 bg-gray-800/70 rounded-full hover:bg-gray-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                    <MessageCircle className="w-7 h-7" />
                  </button>
                  <span className="text-xs mt-1 font-semibold">{post.comment_count}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${isBookmarked ? 'bg-yellow-500' : 'bg-gray-800/70 hover:bg-gray-700'
                      }`}
                  >
                    <Bookmark className={`w-7 h-7 transition-all ${isBookmarked ? 'fill-white scale-110' : ''}`} />
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

        {/* Scroll Indicators - Fixed Position */}
        <div className="hidden md:fixed md:right-8 md:top-1/2 md:transform md:-translate-y-1/2 md:flex md:flex-col md:space-y-4 md:z-20">
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

          {/* Page Indicators */}
          {/* <div className="flex flex-col items-center space-y-2">
            {postsRef.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateToVideo(index)}
                disabled={isScrolling}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentVideoIndex
                  ? 'bg-white scale-150'
                  : 'bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div> */}

          <button
            onClick={() => navigateToVideo(currentVideoIndex + 1)}
            className={`w-10 h-10 rounded-full bg-black/50 flex items-center justify-center transition-all duration-300 ${currentVideoIndex === postsRef.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 hover:scale-110'
              }`}
            disabled={currentVideoIndex === postsRef.length - 1 || isScrolling}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Top Right Menu */}
      <div className="fixed top-4.5 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 rounded-full px-4 py-2 z-30 md:top-4 md:right-4 md:left-auto md:transform-none">
        <button className="flex items-center space-x-2 hover:text-gray-300 transition">
          <Download className="w-5 h-5" />
          <span className="text-sm">Download APP</span>
        </button>
      </div>

    </div>
  );
}
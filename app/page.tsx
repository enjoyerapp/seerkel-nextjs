'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Post } from '@/models/post';
import PostsView from '@/components/Postsview';
import DownloadAppButton from '@/components/DownloadAppButton';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const resFetch = await fetch("/api/posts", {
          method: "POST",
          body: JSON.stringify({ "Sa": "AS", "indexName": "prod_POSTS_by_popularity" }),
        });
        const { posts } = await resFetch.json();
        
        setPosts(posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading posts...</p>
            </div>
          </div>
        ) : (
          <PostsView posts={posts} />
        )}
      </div>

      {/* Top Right Menu */}
      <DownloadAppButton></DownloadAppButton>
    </div>
  );
}
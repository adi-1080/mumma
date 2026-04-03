'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface CommunityPost {
  id: string;
  caption: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
    username?: string;
  } | null;
  result: {
    score: number;
    recipeName: string;
    foodPhotoUrl?: string;
    selfieUrl?: string;
  };
  sessionId: string; // Add session ID for navigation
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community?page=${page}&limit=12`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="main-container fade-up">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
        <div>
          <h2 className="font-lilita text-2xl text-dark">Community</h2>
          <p className="text-xs font-bold text-dark/50 mt-0.5">
            see what everyone's making! <span className="emoji-sparkle"></span>
          </p>
        </div>
        <Link href="/cook">
          <Button className="px-4.5 py-2.5 text-sm">
            cook now →
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-[200px] bg-gray-100"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Community Posts Grid */}
      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/recipes/${post.sessionId}`}>
            <Card 
              className="overflow-hidden cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-custom-hover transition-all"
            >
              {/* Poster-style Card */}
              <div className="relative">
                {/* Header with Recipe Name */}
                <div className="bg-yellow border-2 border-dashed border-dark px-3 py-2">
                  <div className="font-lilita text-sm font-bold text-dark text-center">
                    {post.result.recipeName}
                  </div>
                </div>

                {/* Photo Area */}
                <div className="relative h-[180px] bg-gray-50">
                  {post.result.foodPhotoUrl ? (
                    <img 
                      src={post.result.foodPhotoUrl} 
                      alt={post.result.recipeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🍽️
                    </div>
                  )}
                  
                  {/* Score Badge */}
                  <div className="absolute top-2 right-2 bg-pink border-2 border-dark rounded-full w-12 h-12 flex items-center justify-center shadow-custom-small">
                    <span className="font-lilita text-xs font-bold text-white">
                      {post.result.score}/10
                    </span>
                  </div>
                </div>

                {/* User Info and Caption */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-dark flex-shrink-0">
                      {post.user?.image ? (
                        <img 
                          src={post.user.image} 
                          alt={post.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue flex items-center justify-center text-xs">
                          👤
                        </div>
                      )}
                    </div>
                    
                    {/* User Name */}
                    <div className="flex-1 min-w-0">
                      <div className="font-nunito font-bold text-dark text-sm">
                        {post.user?.name || 'Anonymous'}
                      </div>
                      {post.user?.username && (
                        <div className="text-xs font-bold text-dark/60">
                          @{post.user.username}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mumma Bubble */}
                  <div className="relative">
                    <div className="bg-yellow border-2 border-dark rounded-[14px] rounded-tl-[4px] p-3 text-sm font-bold text-dark leading-relaxed shadow-custom">
                      {post.caption ? (
                        <>"{post.caption}"</>
                      ) : (
                        <span className="text-dark/60 italic">No caption provided</span>
                      )}
                    </div>
                    {/* Bubble Tail */}
                    <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-b-8 border-b-yellow border-r-transparent transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="text-center mt-6">
          <Button 
            onClick={loadMore}
            variant="secondary"
            className="px-6"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* No Posts State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="font-lilita text-xl text-dark mb-2">No community posts yet</h3>
          <p className="text-sm font-bold text-dark/60 mb-4">
            Be the first to share your cooking creations!
          </p>
          <Link href="/cook">
            <Button>Start Cooking</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

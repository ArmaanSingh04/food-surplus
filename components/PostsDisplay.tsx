"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAllPosts } from "@/app/actions";

interface Post {
  post_id: number;
  food_name: string;
  food_type: "veg" | "nonveg";
  quantity_value: number;
  quantity_type: "plates" | "kg" | "items";
  expiry_timer: string;
  image: string[];
  freshness_status: "freshcooked" | "packaged" | "near_expiry" | "unknown";
}

export default function PostsDisplay() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await getAllPosts();
        if (result.success) {
          setPosts(result.posts);
        } else {
          setError(result.error || "Failed to fetch posts");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleImageChange = (postId: number, direction: 'next' | 'prev') => {
    setActiveImageIndexes(prev => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find(p => p.post_id === postId);
      if (!post) return prev;

      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % post.image.length;
      } else {
        newIndex = currentIndex === 0 ? post.image.length - 1 : currentIndex - 1;
      }

      return { ...prev, [postId]: newIndex };
    });
  };

  const getFreshnessStatusColor = (status: string) => {
    switch (status) {
      case 'freshcooked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'packaged':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'near_expiry':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unknown':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFoodTypeColor = (type: string) => {
    return type === 'veg' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatExpiryTime = (expiryTime: string) => {
    const expiry = new Date(expiryTime);
    const now = new Date();
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours left`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days left`;
    }
  };

  const handleClaim = async (postId: number) => {
    // TODO: Implement claim functionality
    console.log(`Claiming post ${postId}`);
    alert(`Claim functionality for post ${postId} will be implemented soon!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium">{error}</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg font-medium">No posts available</div>
        <p className="text-gray-400 mt-2">Check back later for food donations!</p>
      </div>
    );
  }

  const isRecipient = session?.user?.role === "USER";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Food Donations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.post_id} className="card group">
            {/* Image Slider */}
            <div className="relative mb-4 overflow-hidden rounded-lg">
              {post.image.length > 0 && (
                <>
                  <img
                    src={post.image[activeImageIndexes[post.post_id] || 0]}
                    alt={post.food_name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Navigation Arrows */}
                  {post.image.length > 1 && (
                    <>
                      <button
                        onClick={() => handleImageChange(post.post_id, 'prev')}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleImageChange(post.post_id, 'next')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {post.image.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndexes(prev => ({ ...prev, [post.post_id]: index }))}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === (activeImageIndexes[post.post_id] || 0)
                                ? 'bg-white'
                                : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Post Content */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {post.food_name}
                </h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getFoodTypeColor(post.food_type)}`}>
                    {post.food_type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getFreshnessStatusColor(post.freshness_status)}`}>
                    {post.freshness_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">
                  {post.quantity_value} {post.quantity_type}
                </span>
                <span className={`font-medium ${
                  new Date(post.expiry_timer) < new Date() 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {formatExpiryTime(post.expiry_timer)}
                </span>
              </div>

              {/* Claim Button for Recipients */}
              {isRecipient && (
                <button
                  onClick={() => handleClaim(post.post_id)}
                  className="w-full btn-primary text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                >
                  Claim Food
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

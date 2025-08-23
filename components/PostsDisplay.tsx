"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAllPosts } from "@/app/actions";
import ClaimFoodModal from "./ClaimFoodModal";

interface Post {
  post_id: number;
  food_name: string;
  food_type: "veg" | "nonveg";
  quantity_value: number;
  quantity_type: "plates" | "kg" | "items";
  expiry_timer: Date;
  image: string[];
  freshness_status: "freshcooked" | "packaged" | "near_expiry" | "unknown";
  address?: string;
  userClaimStatus?: "pending" | "accepted" | null;
  leftoverQuantity: number;
  isAvailable: boolean;
}

export default function PostsDisplay() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: number]: number }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await getAllPosts(session?.user?.id);
        if (result.success && result.posts) {
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

    if (session?.user?.id) {
      fetchPosts();
    }
  }, [session?.user?.id]);

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

  const formatExpiryTime = (expiryTime: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours left`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days left`;
    }
  };

  const refreshPosts = async () => {
    try {
      const result = await getAllPosts(session?.user?.id);
      if (result.success && result.posts) {
        setPosts(result.posts);
      }
    } catch (err) {
      console.error("Error refreshing posts:", err);
    }
  };

  const handleClaim = async (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
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
          <div key={post.post_id} className={`card group ${!post.isAvailable ? 'opacity-60' : ''}`}>
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
                  {!post.isAvailable && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">
                      Fully Claimed
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              {post.address && (
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8c0 7-7.5 13-7.5 13S4.5 15 4.5 8a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="truncate" title={post.address}>{post.address}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {post.leftoverQuantity > 0 ? (
                      <span className="text-green-600">
                        {post.leftoverQuantity} {post.quantity_type} available
                      </span>
                    ) : (
                      <span className="text-red-600">
                        No {post.quantity_type} available
                      </span>
                    )}
                  </span>
                  {post.leftoverQuantity < post.quantity_value && (
                    <span className="text-xs text-gray-500">
                      Originally: {post.quantity_value} {post.quantity_type}
                    </span>
                  )}
                </div>
                <span className={`font-medium ${
                  post.expiry_timer < new Date() 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {formatExpiryTime(post.expiry_timer)}
                </span>
              </div>

              {/* Claim Button for Recipients */}
              {isRecipient && (
                <>
                  {post.userClaimStatus ? (
                    <div className="w-full py-2 px-4 rounded-lg font-medium text-center">
                      {post.userClaimStatus === 'accepted' ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg py-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Claim Accepted</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg py-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Claim Pending</span>
                        </div>
                      )}
                    </div>
                  ) : !post.isAvailable ? (
                    <div className="w-full py-2 px-4 rounded-lg font-medium text-center">
                      <div className="flex items-center justify-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg py-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Unavailable</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(post)}
                      className="w-full btn-primary text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                    >
                      Claim Food
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Claim Food Modal */}
      {selectedPost && (
        <ClaimFoodModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
            refreshPosts();
          }}
          postId={selectedPost.post_id}
          foodName={selectedPost.food_name}
          maxQuantity={selectedPost.quantity_value}
          quantityType={selectedPost.quantity_type}
          leftoverQuantity={selectedPost.leftoverQuantity}
          onClaimSuccess={refreshPosts}
        />
      )}
    </div>
  );
}

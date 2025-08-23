"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostsDisplay from "@/components/PostsDisplay";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const userRole = session?.user?.role || "USER";

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">🍽️</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-amber-600 bg-clip-text text-transparent">
                  FoodSurplus
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {/* Role Button */}
                <div className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg">
                  {userRole === "DONOR" ? "DONOR" : "RECIPIENT"}
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {userRole === "DONOR" && (
                  <Link
                    href="/donor/form"
                    className="btn-secondary text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                  >
                    Post Surplus Food
                  </Link>
                )}
                
                <button
                  onClick={() => signOut()}
                  className="cursor-pointer text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {/* Role Button in Mobile */}
              <div className="px-3 py-2">
                <div className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg text-center">
                  {userRole === "DONOR" ? "DONOR" : "RECIPIENT"}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center space-x-3">
                  {/* Post Surplus Food Button for Donors in Mobile */}
                  {userRole === "DONOR" && (
                    <Link
                      href="/donor/form"
                      className="btn-secondary text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Post Surplus Food
                    </Link>
                  )}
                  
                  <button
                    onClick={() => signOut()}
                    className="cursor-pointer block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostsDisplay />
      </div>
    </div>
  );
}
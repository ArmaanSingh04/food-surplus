"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() || "/";

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🍽️</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                FoodSurplus
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/") ? "text-primary-600 bg-primary-50" : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                }`}
              >
                Home
              </Link>

              <Link
                href="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/about") ? "text-primary-600 bg-primary-50" : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                }`}
              >
                About
              </Link>

              <Link
                href="/how-it-works"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/how-it-works") ? "text-primary-600 bg-primary-50" : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                }`}
              >
                How It Works
              </Link> */}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Login
              </Link>

              <Link href="/register" className="btn-primary font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((s) => !s)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-secondary-200">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive("/") ? "text-primary-600 bg-primary-50" : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive("/about") ? "text-primary-600 bg-primary-50" : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/how-it-works"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive("/how-it-works") ? "text-primary-600 bg-primary-50" : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>

            <div className="border-t border-secondary-200 pt-4 pb-3">
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>

                <Link href="/register" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

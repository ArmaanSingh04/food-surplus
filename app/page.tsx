import Navigation from '@/components/Navigation';
import Link from 'next/link';
import prisma from '@/db';
import { NEXT_AUTH } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const users = await prisma.user.count();
  const posts = await prisma.post.count();
  const recentPosts = await prisma.post.findMany({
    where: {
      expiry_timer: {
        gt: new Date(),
      },
    },
    orderBy: { post_id: 'desc' },
    take: 6,
    select: {
      post_id: true,
      food_name: true,
      image: true,
      quantity_value: true,
      quantity_type: true,
      freshness_status: true,
      address: true,
      expiry_timer: true,
    },
  });

  const session = await getServerSession(NEXT_AUTH);

  if(session != null){
    redirect('/dashboard');
  }

  return(
    <div className="bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full blur-xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
                🌱 Zero Food Waste Initiative
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Share Food,
                <span className="text-primary-800"> Save Planet</span>
              </h1>
              <p className="text-xl text-secondary-100 mb-8 leading-relaxed">
                Connect surplus food with those who need it. Join our
                campus-wide network to reduce waste, help communities, and build
                a sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="btn-primary text-lg px-8 py-4 text-center transform hover:scale-105"
                >
                  Sign Up Free
                </Link>
                {/* <Link
                  href="/how-it-works"
                  className="btn-secondary text-lg px-8 py-4 text-center transform hover:scale-105"
                >
                  Learn More
                </Link> */}
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 border border-primary-100 hover:shadow-3xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-white text-4xl">🍽️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Food Sharing Network
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connecting donors with recipients
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
                      <div className="font-bold text-primary-700 text-lg">
                        {posts}+
                      </div>
                      <div className="text-gray-600">Meals Saved</div>
                    </div>
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
                      <div className="font-bold text-primary-700 text-lg">
                        {users}+
                      </div>
                      <div className="text-gray-600">Active Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Donations</h2>
            <Link href="/register" className="btn-secondary">Join and Donate</Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-gray-500">No active donations yet. Be the first to donate!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((p) => (
                <div key={p.post_id} className="card overflow-hidden">
                  <div className="h-44 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image?.[0] || '/next.svg'}
                      alt={p.food_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{p.food_name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full border bg-primary-50 text-primary-700 border-primary-200">
                        {p.freshness_status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {p.quantity_value} {p.quantity_type} • {new Date(p.expiry_timer).toLocaleString()}
                    </div>
                    {p.address && (
                      <div className="text-sm text-gray-700 truncate" title={p.address}>
                        📍 {p.address}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border shadow-sm">
              <div className="text-3xl mb-3">🥗</div>
              <h3 className="font-semibold text-lg mb-1">Post Surplus Food</h3>
              <p className="text-gray-600 text-sm">Donors add details like food type, quantity, expiry, images, and address.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
              <div className="text-3xl mb-3">🔎</div>
              <h3 className="font-semibold text-lg mb-1">Discover Nearby</h3>
              <p className="text-gray-600 text-sm">Recipients browse active donations and claim what they need.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-lg mb-1">Pickup & Reduce Waste</h3>
              <p className="text-gray-600 text-sm">Coordinate pickup using the provided address before expiry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 text-center">
              <div className="text-3xl font-bold text-primary-700">{posts}+</div>
              <div className="text-gray-600">Donations Posted</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 text-center">
              <div className="text-3xl font-bold text-secondary-700">{users}+</div>
              <div className="text-gray-600">Community Members</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-secondary-200 text-center">
              <div className="text-3xl font-bold text-secondary-700">{Math.max(posts * 3, posts)}+</div>
              <div className="text-gray-600">Estimated Meals Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">FoodSurplus</h3>
              <p className="text-sm text-gray-400">Reducing food waste by connecting surplus with need.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-white" href="/">Home</Link></li>
                <li><Link className="hover:text-white" href="/register">Register</Link></li>
                <li><Link className="hover:text-white" href="/login">Login</Link></li>
                <li><Link className="hover:text-white" href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a className="hover:text-white" href="https://github.com/ArmaanSingh04/food-surplus" target="_blank" rel="noreferrer">GitHub</a></li>
                <li><a className="hover:text-white" href="#">Privacy</a></li>
                <li><a className="hover:text-white" href="#">Terms</a></li>
                <li><a className="hover:text-white" href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-gray-500">
            © {new Date().getFullYear()} FoodSurplus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

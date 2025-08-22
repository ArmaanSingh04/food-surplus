import Navigation from '@/components/Navigation';
import Link from 'next/link';
import prisma from '@/db';
import { NEXT_AUTH } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const users = await prisma.user.count();
  const posts = await prisma.post.count();

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
    </div>
  );
}

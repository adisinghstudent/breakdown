import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="display-title text-7xl sm:text-8xl text-gray-900 mb-2">
          Breakdown
        </h1>
        <p className="subtitle-cursive text-2xl sm:text-3xl text-gray-800 mb-10">
          by Silicon Valhalla
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link href="/create-project" className="glass-btn glass-btn-primary text-lg">
            Start Building
          </Link>
          <Link href="/projects" className="glass-btn text-lg">
            View Projects
          </Link>
          <Link href="/chat" className="glass-btn text-lg">
            Chat with AI
          </Link>
        </div>

        <div className="text-center mb-16">
          <p className="text-sm text-gray-700 subtitle-cursive">
            Create, track, and manage AI-powered projects with automated task breakdown and team assignments
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Not sure where to start? Try one of these:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/create-project?template=reporting-dashboard"
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 border border-gray-300 hover:border-orange-400 transition-colors"
            >
              📊 Reporting Dashboard
            </Link>
            <Link
              href="/create-project?template=gaming-platform"
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 border border-gray-300 hover:border-orange-400 transition-colors"
            >
              🎮 Gaming Platform
            </Link>
            <Link
              href="/create-project?template=onboarding-portal"
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 border border-gray-300 hover:border-orange-400 transition-colors"
            >
              🚀 Onboarding Portal
            </Link>
            <Link
              href="/create-project?template=networking-app"
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 border border-gray-300 hover:border-orange-400 transition-colors"
            >
              💼 Networking App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

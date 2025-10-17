import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Shape your ideas into
          <br />
          apps that work your way
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Breakdown lets you build fully-functional projects in minutes with just your words. No coding necessary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/create-project"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Start Building
          </Link>
          <Link
            href="/projects"
            className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg border-2 border-gray-300 transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/chat"
            className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg border-2 border-gray-300 transition-colors"
          >
            Chat with AI
          </Link>
        </div>

        <div className="text-center mb-16">
          <p className="text-sm text-gray-600">
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

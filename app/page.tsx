"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white text-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
          Breakdown by team
          <br />
          <span style={{ fontFamily: "var(--font-dancing)" }} className="text-5xl sm:text-6xl md:text-7xl font-normal">
            Silicon Valhalla
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-gray-500">
          A minimal, modern entry point. Continue to open the chat.
        </p>
        <div className="mt-10">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Continue
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M4.5 12a.75.75 0 0 1 .75-.75h11.69l-3.72-3.72a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H5.25A.75.75 0 0 1 4.5 12Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}

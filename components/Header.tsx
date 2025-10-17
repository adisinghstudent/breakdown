'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  const isHome = pathname === '/';

  const navLink = (
    href: string,
    label: string,
    { primary = false }: { primary?: boolean } = {}
  ) => (
    <Link
      href={href}
      className={`${primary ? 'glass-btn glass-btn-primary' : 'glass-btn'} text-sm`}
    >
      {label}
    </Link>
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center">
      <div className="pointer-events-auto glass-panel rounded-full ring-1 ring-black/10 dark:ring-white/10 px-3 py-2 flex items-center gap-2 shadow-lg">
        {!isHome && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="glass-btn text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        <div className="mx-1 hidden sm:block h-5 w-px bg-black/10 dark:bg-white/10" />

        {navLink('/', 'Home')}
        {navLink('/projects', 'Projects')}
        {navLink('/chat', 'Builder', { primary: true })}
      </div>
    </div>
  );
}

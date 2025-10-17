import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo') || 'adisinghstudent/PiedPiper_megarepo';

    const q = `repo:${repo}+type:issue`; // all issues, any state
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=1`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'chatkit-starter-app',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text();
      console.error('GitHub API error', res.status, text);
      return NextResponse.json({ repo, total: 0 }, { status: 200 });
    }
    const data = (await res.json()) as { total_count?: number };
    const total = typeof data.total_count === 'number' ? data.total_count : 0;
    return NextResponse.json({ repo, total });
  } catch (error) {
    console.error('Failed to fetch GitHub issues count', error);
    return NextResponse.json({ repo: 'adisinghstudent/PiedPiper_megarepo', total: 0 });
  }
}


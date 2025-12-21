import { NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

// In-memory cache for tweets (X API free tier: 1 request per 15 min)
let tweetCache: { data: ActivityEntry[]; timestamp: number } | null = null;
const TWEET_CACHE_TTL = 15 * 60 * 1000; // 15 minutes in ms

export interface ActivityEntry {
  id: string;
  type: 'commit' | 'tweet';
  message: string;
  date: string;
  timestamp: string; // ISO string for sorting
  source: string;    // repo name or "twitter"
  url: string | null;
  isPrivate?: boolean;
  shortHash?: string; // commit-specific
}

// Legacy interface for backward compatibility
export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  date: string;
  repo: string;
  isPrivate: boolean;
  url: string | null;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
  html_url: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  pushed_at: string;
}

interface TwitterApiResponse {
  data?: {
    id: string;
    text: string;
    created_at: string;
  }[];
  errors?: { message: string }[];
}

// Use native https module to avoid Next.js fetch issues
function fetchGitHub<T>(path: string, timeoutMs = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'krait-portfolio',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      timeout: timeoutMs
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function fetchTwitter<T>(path: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = process.env.X_BEARER_TOKEN;

    if (!token) {
      reject(new Error('X_BEARER_TOKEN not configured'));
      return;
    }

    const options = {
      hostname: 'api.twitter.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'krait-portfolio',
      },
      timeout: timeoutMs
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

async function fetchTweets(): Promise<ActivityEntry[]> {
  const userId = process.env.X_USER_ID;

  if (!userId || !process.env.X_BEARER_TOKEN) {
    return [];
  }

  // Check cache first (X API free tier is 1 req/15 min)
  const now = Date.now();
  if (tweetCache && (now - tweetCache.timestamp) < TWEET_CACHE_TTL) {
    // Update relative times on cached data
    return tweetCache.data.map(tweet => ({
      ...tweet,
      date: getRelativeTime(tweet.timestamp),
    }));
  }

  try {
    const response = await fetchTwitter<TwitterApiResponse>(
      `/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at`,
      8000
    );

    if (response.errors || !response.data) {
      console.error('Twitter API returned errors or no data:', response.errors);
      // Return cached data if available, even if stale
      if (tweetCache) {
        return tweetCache.data.map(tweet => ({
          ...tweet,
          date: getRelativeTime(tweet.timestamp),
        }));
      }
      return [];
    }

    const tweets = response.data.map((tweet): ActivityEntry => ({
      id: tweet.id,
      type: 'tweet',
      message: tweet.text.split('\n')[0].substring(0, 80) + (tweet.text.length > 80 ? '...' : ''),
      date: getRelativeTime(tweet.created_at),
      timestamp: tweet.created_at,
      source: 'twitter',
      url: `https://x.com/i/status/${tweet.id}`,
    }));

    // Update cache
    tweetCache = { data: tweets, timestamp: now };

    return tweets;
  } catch (err) {
    console.error('Twitter API error:', err);
    // Return cached data if available, even if stale
    if (tweetCache) {
      return tweetCache.data.map(tweet => ({
        ...tweet,
        date: getRelativeTime(tweet.timestamp),
      }));
    }
    return [];
  }
}

async function fetchCommits(): Promise<ActivityEntry[]> {
  const username = 'kraitsura';

  try {
    const repos = await fetchGitHub<GitHubRepo[]>(
      `/users/${username}/repos?sort=pushed&per_page=50&type=all`,
      8000
    );

    // Get recent repos (pushed to in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentRepos = repos
      .filter(repo => new Date(repo.pushed_at) > sixMonthsAgo)
      .slice(0, 6);

    const commitPromises = recentRepos.map(async (repo) => {
      try {
        const commits = await fetchGitHub<GitHubCommit[]>(
          `/repos/${repo.full_name}/commits?per_page=3`,
          4000
        );

        return commits.map((commit): ActivityEntry => ({
          id: commit.sha,
          type: 'commit',
          message: repo.private
            ? '[private commit]'
            : commit.commit.message.split('\n')[0],
          date: getRelativeTime(commit.commit.committer.date),
          timestamp: commit.commit.committer.date,
          source: repo.name,
          url: repo.private ? null : commit.html_url,
          isPrivate: repo.private,
          shortHash: commit.sha.substring(0, 7),
        }));
      } catch {
        return [];
      }
    });

    return (await Promise.all(commitPromises)).flat();
  } catch (err) {
    console.error('GitHub API error:', err);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch both commits and tweets in parallel
    const [commits, tweets] = await Promise.all([
      fetchCommits(),
      fetchTweets(),
    ]);

    // Merge and sort by timestamp (most recent first)
    const allActivity = [...commits, ...tweets]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // Also return legacy format for backward compatibility
    const legacyCommits: GitCommit[] = commits
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15)
      .map(c => ({
        hash: c.id,
        shortHash: c.shortHash || c.id.substring(0, 7),
        message: c.message,
        date: c.date,
        repo: c.source,
        isPrivate: c.isPrivate || false,
        url: c.url,
      }));

    return NextResponse.json({
      activity: allActivity,
      commits: legacyCommits, // backward compatibility
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json({ activity: [], commits: [], error: 'unknown' });
  }
}

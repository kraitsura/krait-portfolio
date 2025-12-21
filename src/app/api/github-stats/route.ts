import { NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

interface GitHubRepo {
  name: string;
  full_name: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  private: boolean;
}

interface GitHubCommit {
  sha: string;
  commit: {
    committer: {
      date: string;
    };
  };
}

export interface GithubStats {
  commitsThisWeek: number;
  activeRepos: number;
  currentStreak: number;
}

function fetchGitHub<T>(path: string, timeoutMs = 8000): Promise<T> {
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

export async function GET() {
  try {
    const username = 'kraitsura';
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch repos
    const repos = await fetchGitHub<GitHubRepo[]>(
      `/users/${username}/repos?per_page=100&sort=pushed&type=all`
    );

    // Get recently active repos (pushed in last 2 weeks)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const activeRepos = repos.filter(r => new Date(r.pushed_at) > twoWeeksAgo).slice(0, 10);

    // Fetch commits from active repos in parallel and track which repos have commits
    const commitPromises = activeRepos.map(async (repo) => {
      try {
        const commits = await fetchGitHub<GitHubCommit[]>(
          `/repos/${repo.full_name}/commits?since=${oneWeekAgo.toISOString()}&per_page=100`
        );
        return { repoName: repo.name, commitCount: commits.length };
      } catch {
        return { repoName: repo.name, commitCount: 0 };
      }
    });

    const commitResults = await Promise.all(commitPromises);
    const commitsThisWeek = commitResults.reduce((a, b) => a + b.commitCount, 0);
    const activeReposCount = commitResults.filter(r => r.commitCount > 0).length;

    // Calculate streak from commit dates
    const streakPromises = activeRepos.slice(0, 5).map(async (repo) => {
      try {
        const commits = await fetchGitHub<GitHubCommit[]>(
          `/repos/${repo.full_name}/commits?per_page=50`
        );
        return commits.map(c => c.commit.committer.date.split('T')[0]);
      } catch {
        return [];
      }
    });

    const allDates = (await Promise.all(streakPromises)).flat();
    const uniqueDays = [...new Set(allDates)].sort().reverse();

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDays.includes(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const stats: GithubStats = {
      commitsThisWeek,
      activeRepos: activeReposCount,
      currentStreak
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return NextResponse.json({
      commitsThisWeek: 0,
      activeRepos: 0,
      currentStreak: 0,
      error: 'fetch_failed'
    });
  }
}

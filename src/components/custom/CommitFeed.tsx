import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GitCommit } from 'lucide-react';

interface CommitAuthor {
  date: string;
}

interface CommitDetails {
  message: string;
  author: CommitAuthor;
}

interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: CommitDetails;
  repo: string;
}

const GitHubCommitFeed = ({ username }: { username: string }) => {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/github-commits?username=${username}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch commits');
        }

        const data: GitHubCommit[] = await response.json();
        setCommits(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchCommits();
  }, [username]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl bg-transparent border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse h-8 w-8 border-2 border-[#D4AF37]/30"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl bg-transparent border-none">
        <CardContent className="p-6">
          <div className="text-[#D4AF37]/70">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl bg-transparent border-none">
      <CardHeader className="px-6 pb-2">
        <CardTitle className="flex items-center gap-2 text-[#D4AF37]/70 text-sm uppercase tracking-wider">
          <GitCommit className="h-4 w-4" />
          Git Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-4">
          {commits.map((commit) => (
            <div
              key={commit.sha}
              className="border-b border-[#D4AF37]/10 last:border-0 pb-4 last:pb-0 hover:bg-[#D4AF37]/5 transition-colors rounded-sm p-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <p className="font-normal text-xs text-[#D4AF37]/70">
                    {commit.commit.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#D4AF37]/50">
                    <span className="font-mono">{commit.repo}</span>
                    <span>•</span>
                    <span className="font-mono">
                      {new Date(commit.commit.author.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37]/50 hover:text-[#D4AF37] text-xs transition-colors"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubCommitFeed;
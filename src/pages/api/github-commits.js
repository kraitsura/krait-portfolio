// pages/api/github-commits.js
export default async function handler(req, res) {
    const { username } = req.query;
    const token = process.env.GITHUB_PAT;

    try {
        // Fetch repositories
        const reposResponse = await fetch(
            `https://api.github.com/users/${username}/repos`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!reposResponse.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const repos = await reposResponse.json();

        // Fetch commits from each repository
        const allCommits = await Promise.all(
            repos.map(async (repo) => {
                const commitsResponse = await fetch(
                    `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!commitsResponse.ok) return [];

                const commits = await commitsResponse.json();
                return commits.map(commit => ({
                    ...commit,
                    repo: repo.name
                }));
            })
        );

        // Flatten array and sort by date
        const flattenedCommits = allCommits
            .flat()
            .sort((a, b) =>
                new Date(b.commit.author.date) - new Date(a.commit.author.date)
            )
            .slice(0, 10); // Get most recent 10 commits

        res.status(200).json(flattenedCommits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch commits' });
    }
}
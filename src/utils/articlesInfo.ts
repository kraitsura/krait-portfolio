// utils/articlesInfo.ts

interface ArticleInfo {
    title: string;
    description: string;
    date: string;
}

interface ArticlesInfo {
    [key: string]: ArticleInfo;
}

export const articlesInfo: ArticlesInfo = {
    "future-of-ai": {
        title: "The Future of AI",
        description: "This is a description of my first article.",
        date: "2023-09-01"
    },
    "quantam-computing": {
        title: "Quantam Resonance",
        description: "My journey in learning Next.js and its awesome features.",
        date: "2023-09-15"
    },
    "sustainable-living": {
        title: "Sustainable Ecosystems",
        description: "Exploring the frontiers of sustainable ecosystem modeling.",
        date: "2023-10-01"
    },
};
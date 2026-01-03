"use client";

import ArticleLayout, {
  ArticleSection,
  ArticleParagraph,
} from "@/components/custom/ArticleLayout";

export default function LambsArticle() {
  return (
    <ArticleLayout
      category="Article"
      title="Silence of the Lambs"
      status="in_progress"
      intro={
        <>
          {/* Add intro content here */}
        </>
      }
    >
      {/* Add article content here */}
      <ArticleSection>
        <ArticleParagraph>
          Content coming soon...
        </ArticleParagraph>
      </ArticleSection>
    </ArticleLayout>
  );
}

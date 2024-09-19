import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';


interface ArticleProps {
  article: {
    title: string;
    date: string;
    content: string;
    images: string[];
  };
}

const ArticleComponent: React.FC<ArticleProps> = ({ article }) => {
  return (

    <div className="min-h-screen w-full relative bg-black text-white">
      <div className="absolute inset-0">
        <Image
          src="/assets/background.gif"
          alt="Background GIF"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%),
            linear-gradient(to bottom,
              rgba(0,0,0,0.2) 0%,
              rgba(0,0,0,0.6) 50%,
              rgba(0,0,0,1) 100%)
          `
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <section className="w-full max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-red-500">{article.title}</h2>
          <p className="text-sm text-gray-400 mb-6">{article.date}</p>
          <div className="prose prose-invert">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
          {article.images && article.images.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.images.map((image, index) => (
                <div key={index} className="relative h-64 w-full">
                  <Image
                    src={image}
                    alt={`Article image ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ArticleComponent;
'use client';

export default function AboutLoading() {
  return (
    <div className="h-screen overflow-hidden bg-[#FFFBF0] px-4 sm:px-6 py-16 sm:py-20">
      {/* Sidebar Navigation Skeleton */}
      <nav
        className="sticky top-0 z-10 bg-[#FFFBF0] pb-4 flex flex-col gap-2 mb-8 lg:mb-0 lg:pb-0 lg:bg-transparent lg:static lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:left-[calc(50%-325px-100px)]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {['about', 'projects', 'socials'].map((tab, i) => (
          <div
            key={tab}
            className="h-5 rounded animate-pulse"
            style={{
              width: `${50 + i * 10}px`,
              backgroundColor: 'rgba(26, 26, 26, 0.1)',
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </nav>

      <div className="flex justify-center">
        <div
          className="w-full max-w-[650px]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {/* Title Skeleton */}
          <div
            className="h-10 w-32 rounded mb-2 animate-pulse"
            style={{ backgroundColor: 'rgba(26, 26, 26, 0.1)' }}
          />
          <div
            className="h-8 w-64 rounded mb-8 animate-pulse"
            style={{ backgroundColor: 'rgba(26, 26, 26, 0.08)' }}
          />

          {/* Content Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((paragraph) => (
              <div key={paragraph} className="space-y-2">
                {[1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="h-5 rounded animate-pulse"
                    style={{
                      width: line === 4 ? '60%' : '100%',
                      backgroundColor: 'rgba(26, 26, 26, 0.08)',
                      animationDelay: `${(paragraph * 4 + line) * 30}ms`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

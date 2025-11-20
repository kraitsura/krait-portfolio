export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 overflow-hidden relative">
      {/* Vertical "Projects" Title Skeleton */}
      <div
        className="fixed top-24 left-4 z-10"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
      >
        <div className="h-64 w-12 md:w-16 bg-[var(--theme-primary)]/20 rounded animate-pulse" />
      </div>

      {/* Keyboard shortcuts skeleton */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-10 opacity-50">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-6 w-12 bg-[var(--theme-primary)]/20 rounded animate-pulse" />
            <div className="h-4 w-16 bg-[var(--theme-primary)]/20 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Projects Grid Skeleton */}
      <div className="ml-16 md:ml-24 mt-16 md:mt-20 space-y-6 md:space-y-12">
        {[1, 2, 3].map((category) => (
          <div key={category} className="mb-12">
            {/* Category Title Skeleton */}
            <div className="h-8 md:h-10 w-32 md:w-40 bg-[var(--theme-primary)]/20 rounded mb-3 md:mb-6 animate-pulse" />

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="relative aspect-video border-2 border-[var(--theme-primary)] rounded-sm overflow-hidden animate-pulse"
                >
                  {/* Background shimmer */}
                  <div className="absolute inset-0 bg-[var(--theme-primary)]/5" />

                  {/* Tag skeletons - top right */}
                  <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col items-end space-y-1 md:space-y-2 z-10">
                    {[1, 2, 3, 4].map((tag) => (
                      <div
                        key={tag}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full border border-[var(--theme-primary)]/50 bg-black/40 backdrop-blur-sm animate-pulse"
                        style={{ animationDelay: `${tag * 100}ms` }}
                      />
                    ))}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />

                  {/* Bottom info skeleton */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 md:p-3 lg:p-4">
                    {/* Title skeleton with line */}
                    <div className="relative mb-2">
                      <div className="absolute inset-y-0 left-0 right-0 bg-[var(--theme-primary)]/30 h-[2px] my-auto" />
                      <div className="h-5 md:h-6 lg:h-7 w-3/4 bg-[var(--theme-primary)]/40 inline-block animate-pulse" />
                    </div>
                    {/* Description skeleton */}
                    <div className="space-y-1">
                      <div className="h-3 md:h-4 w-full bg-[var(--theme-primary)]/20 rounded animate-pulse" />
                      <div className="h-3 md:h-4 w-4/5 bg-[var(--theme-primary)]/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailLoading() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-white text-gray-900 flex flex-col font-mono">
      {/* Top Bar Skeleton */}
      <div className="border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between animate-pulse">
        <div className="flex-1 min-w-0">
          <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-64 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {/* Image Area Skeleton */}
        <div className="w-full h-[40vh] md:h-auto md:w-[55%] relative border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 overflow-hidden bg-gray-50 animate-pulse" />

        {/* Info Area Skeleton */}
        <div className="w-full md:w-[45%] overflow-y-auto px-4 md:px-6 py-4 flex-1 min-h-0 h-[60vh] md:h-auto animate-pulse">
          {/* Technologies Skeleton */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>

          {/* Metadata Skeleton */}
          <div className="mb-4 pb-4 border-b border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>

          {/* About Skeleton */}
          <div>
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

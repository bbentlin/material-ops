import { SkeletonBox, SkeletonCard, SkeletonRow, SkeletonText } from "@/components/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header skeleton */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <SkeletonBox className="h-7 w-36" />
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-9 w-64 rounded-lg" />
            <SkeletonBox className="h-9 w-32 rounded-lg" />
            <SkeletonBox className="h-9 w-32 rounded-lg" />
            <SkeletonBox className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <SkeletonText className="h-3 w-20 mb-3" />
              <SkeletonText className="h-7 w-12 mb-2 rounded" />
              <SkeletonText className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <SkeletonText className="h-4 w-40 mb-5" />
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex-1 rounded-sm bg-gray-200 dark:bg-gray-700"
                    style={{ height: `${30 + Math.sin(j) * 20 + 40}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Materials table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <SkeletonText className="h-5 w-32" />
            <div className="flex gap-2">
              <SkeletonBox className="h-9 w-24 rounded-lg" />
              <SkeletonBox className="h-9 w-28 rounded-lg" />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {["w-32", "w-24", "w-48", "w-16", "w-20", "w-24"].map((w, i) => (
                  <th key={i} className="px-5 py-3">
                    <SkeletonText className={`h-3 ${w}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} cols={7} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Movements table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <SkeletonText className="h-4 w-40" />
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {["w-24", "w-32", "w-16", "w-28"].map((w, i) => (
                  <th key={i} className="px-5 py-3">
                    <SkeletonText className={`h-3 ${w}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
import { SkeletonBox, SkeletonCard, SkeletonTableBody, SkeletonText } from "@/components/Skeleton";

const CHART_BAR_HEIGHTS = ["54%", "66%", "48%", "72%", "60%", "76%", "58%", "70%", "62%", "68%"];

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <SkeletonBox className="h-7 w-36" />
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-9 w-64 rounded-lg" />
            <SkeletonBox className="h-9 w-32 rounded-lg" />
            <SkeletonBox className="h-9 w-32 rounded-lg" />
            <SkeletonBox className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <SkeletonText className="mb-3 h-3 w-20" />
              <SkeletonText className="mb-2 h-7 w-12 rounded" />
              <SkeletonText className="h-3 w-28" />
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <SkeletonText className="mb-5 h-4 w-40" />
              <div className="flex h-32 items-end gap-2">
                {CHART_BAR_HEIGHTS.map((height, j) => (
                  <div
                    key={j}
                    className="flex-1 rounded-sm bg-gray-200 dark:bg-gray-700"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
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
            <SkeletonTableBody rows={8} cols={7} cellClassName="px-5 py-4" />
          </table>
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-5 dark:border-gray-700">
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
            <SkeletonTableBody rows={5} cols={5} cellClassName="px-5 py-4" />
          </table>
        </div>
      </main>
    </div>
  );
}
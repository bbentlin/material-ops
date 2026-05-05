export function SkeletonBox({ className = ""}: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

export function SkeletonText({ className = ""}: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}
    />
  );
}

export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ className = ""}: { className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}
    >
      <div className="h-3 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
      <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-3 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}
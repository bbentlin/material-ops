const basePulse = 
  "bg-gray-200 dark:bg-gray-700 motion-safe:animate-pulse motion-reduce:animate-none";

export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`${basePulse} rounded ${className}`} />
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`${basePulse} rounded-full ${className}`} />
}

export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-4 ${basePulse} rounded-full w-3/4`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className={`h-3 w-24 ${basePulse} rounded-full mb-3`} />
      <div className={`h-8 w-16 ${basePulse} rounded mb-2`} />
      <div className={`h-3 w-32 ${basePulse} rounded-full`} />
    </div>
  );
}
"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard segment error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-2">
          Dashboard error
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          This dashboard section failed to load correctly.
        </p>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Retry section
          </button>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to dashboard home
          </button>
        </div>
      </div>
    </div>
  );
}
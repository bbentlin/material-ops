"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          An unexpected error occurred while rendering this page.
        </p>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
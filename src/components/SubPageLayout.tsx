"use client";

import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import { SkeletonBox, SkeletonText } from "@/components/Skeleton";
import type { ReactNode } from "react";

interface SubPageLayoutProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: "max-w-5xl" | "max-w-7xl";
  actions?: ReactNode;
  children: ReactNode;
  sticky?: boolean;
  loading?: boolean;
}

export default function SubPageLayout({
  title,
  backHref = "/dashboard",
  backLabel = "← Back to Dashboard",
  maxWidth = "max-w-7xl",
  actions,
  children,
  sticky,
  loading,
}: SubPageLayoutProps) {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${sticky ? "sticky top-0 z-20" : ""}`}>
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(backHref)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {backLabel}
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <>
                <SkeletonBox className="h-9 w-48 rounded-lg" />
                <SkeletonBox className="h-9 w-32 rounded-lg" />
              </>
            ) : (
              actions
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <SkeletonText className="h-3 w-20 mb-3" />
                  <SkeletonBox className="h-8 w-14 rounded mb-2" />
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <SkeletonText className="h-5 w-24" />
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
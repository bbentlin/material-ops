"use client";

import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import type { ReactNode } from "react";

interface SubPageLayoutProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: "max-w-5xl" | "max-w-7xl";
  actions?: ReactNode;      // right side of header (search bar, filters, etc.)
  children: ReactNode;
  sticky?: boolean;
}

export default function SubPageLayout({
  title,
  backHref = "/dashboard",
  backLabel = "← Back to Dashboard",
  maxWidth = "max-w-7xl",
  actions,
  children,
  sticky,
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
            {actions}
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
        {children}
      </main>
    </div>
  );
}
"use client";

import type { StatsData, WidgetData } from "@/types/dashboard";

type Props = {
  stats: StatsData | null;
  widgets: WidgetData | null;
  lowStockOnly: boolean;
  criticalCount: number;
  lowCount: number;
  onToggleLowStockAction: () => void;
};

export default function DashboardStatsCards(props: Props) {
  const activePOs = props.widgets?.poSummary
    ? (props.widgets.poSummary["SUBMITTED"] ?? 0) +
      (props.widgets.poSummary["APPROVED"] ?? 0) +
      (props.widgets.poSummary["PARTIALLY_RECEIVED"] ?? 0)
    : 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Total Materials</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          {props.stats?.totalMaterials ?? 0}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          {props.stats?.totalStock ?? 0}
        </div>
      </div>

      <button
        onClick={props.onToggleLowStockAction}
        className={`rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-all dark:bg-gray-800 sm:p-6 ${
          props.lowStockOnly
            ? "border-orange-400 ring-2 ring-orange-200 dark:border-orange-500 dark:ring-orange-900"
            : "border-gray-200 hover:border-orange-300 dark:border-gray-700 dark:hover:border-orange-600"
        }`}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock</span>
          {(props.stats?.lowStockCount ?? 0) > 0 && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" />
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-600 sm:text-3xl">{props.stats?.lowStockCount ?? 0}</span>
          {props.lowStockOnly && <span className="text-xs font-medium text-orange-500">Filter active</span>}
        </div>

        {(props.stats?.lowStockCount ?? 0) > 0 && (
          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {props.criticalCount > 0 && (
              <span className="font-medium text-red-500 dark:text-red-400">{props.criticalCount} critical</span>
            )}
            {props.criticalCount > 0 && props.lowCount > 0 && " • "}
            {props.lowCount > 0 && (
              <span className="text-orange-500 dark:text-orange-400">{props.lowCount} low</span>
            )}
            {" · Tap to "}
            {props.lowStockOnly ? "show all" : "filter"}
          </div>
        )}
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Active POs</div>
        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 sm:text-3xl">{activePOs}</div>
        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {props.widgets?.poSummary?.["SUBMITTED"] ?? 0} submitted · {props.widgets?.poSummary?.["APPROVED"] ?? 0} approved
        </div>
      </div>
    </div>
  );
}
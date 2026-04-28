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
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Total Materials
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {props.stats?.totalMaterials ?? 0}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Total Stock
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {props.stats?.totalStock ?? 0}
        </div>
      </div>

      <button
        onClick={props.onToggleLowStockAction}
        className={`text-left bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 transition-all ${
          props.lowStockOnly
            ? "border-orange-400 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900"
            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Low Stock
          </span>
          {(props.stats?.lowStockCount ?? 0) > 0 && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-orange-600">
            {props.stats?.lowStockCount ?? 0}
          </span>
          {props.lowStockOnly && (
            <span className="text-xs text-orange-500 font-medium">Filter active</span>
          )}
        </div>

        {(props.stats?.lowStockCount ?? 0) > 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {props.criticalCount > 0 && (
              <span className="text-red-500 dark:text-red-400 font-medium">
                {props.criticalCount} critical
              </span>
            )}
            {props.criticalCount > 0 && props.lowCount > 0 && " . "}
            {props.lowCount > 0 && (
              <span className="text-orange-500 dark:text-orange-400">
                {props.lowCount} low
              </span>
            )}
            {" · Click to "}
            {props.lowStockOnly ? "show all" : "filter"}
          </div>
        )}
      </button>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Active POs
        </div>
        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {props.widgets?.poSummary
            ? (props.widgets.poSummary["SUBMITTED"] ?? 0) + 
              (props.widgets.poSummary["APPROVED"] ?? 0) +
              (props.widgets.poSummary["PARTIALLY_RECEIVED"] ?? 0) 
            : 0}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {props.widgets?.poSummary?.["SUBMITTED"] ?? 0} submitted ·{" "}
          {props.widgets?.poSummary?.["APPROVED"] ?? 0} approved
        </div>
      </div>
    </div>
  );
}
"use client";

import { SkeletonBox, SkeletonText } from "@/components/Skeleton";
import type { WidgetData } from "@/types/dashboard";

type Props = {
  widgets: WidgetData | null;
  onOpenMaterialAction: (materialId: string) => void;
};

const poStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-400",
  SUBMITTED: "bg-blue-500",
  APPROVED: "bg-green-500",
  PARTIALLY_RECEIVED: "bg-yellow-500",
  RECEIVED: "bg-emerald-600",
  CANCELLED: "bg-red-500",
};

export default function DashboardWidgets(props: Props) {
  const poSummary = props.widgets?.poSummary;
  const widgetsLoading = !props.widgets;

  const maxVelocityValue = Math.max(
    props.widgets?.stockVelocity?.totalInbound ?? 0,
    props.widgets?.stockVelocity?.totalOutbound ?? 0,
    props.widgets?.stockVelocity?.totalTransfers ?? 0,
    1
  );

  const totalPOs = poSummary ? Object.values(poSummary).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Inventory Health</h3>
        {props.widgets?.inventoryHealth ? (
          <>
            <div className="relative mx-auto mb-4 h-24 w-24 sm:h-28 sm:w-28">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${props.widgets.inventoryHealth.healthPercent} ${100 - props.widgets.inventoryHealth.healthPercent}`}
                  strokeLinecap="round"
                  className={
                    props.widgets.inventoryHealth.healthPercent >= 80
                      ? "stroke-current text-green-500"
                      : props.widgets.inventoryHealth.healthPercent >= 50
                        ? "stroke-current text-yellow-500"
                        : "stroke-current text-red-500"
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
                  {props.widgets.inventoryHealth.healthPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                  Healthy
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{props.widgets.inventoryHealth.healthy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-500" />
                  Low
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{props.widgets.inventoryHealth.low}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
                  Critical
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{props.widgets.inventoryHealth.critical}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 py-4">
            <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 sm:h-28 sm:w-28" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <SkeletonText className="h-3 w-20" />
                <SkeletonText className="h-3 w-8" />
              </div>
              <div className="flex justify-between">
                <SkeletonText className="h-3 w-16" />
                <SkeletonText className="h-3 w-8" />
              </div>
              <div className="flex justify-between">
                <SkeletonText className="h-3 w-20" />
                <SkeletonText className="h-3 w-8" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Stock Velocity</h3>
        {props.widgets?.stockVelocity ? (
          <>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Inbound</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {props.widgets.stockVelocity.totalInbound}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.min((props.widgets.stockVelocity.totalInbound / maxVelocityValue) * 100, 100)}%`,
                      minWidth: props.widgets.stockVelocity.totalInbound > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Outbound</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {props.widgets.stockVelocity.totalOutbound}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all"
                    style={{
                      width: `${Math.min((props.widgets.stockVelocity.totalOutbound / maxVelocityValue) * 100, 100)}%`,
                      minWidth: props.widgets.stockVelocity.totalOutbound > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Transfers</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {props.widgets.stockVelocity.totalTransfers}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${Math.min((props.widgets.stockVelocity.totalTransfers / maxVelocityValue) * 100, 100)}%`,
                      minWidth: props.widgets.stockVelocity.totalTransfers > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
              Last {props.widgets.stockVelocity.periodDays} days
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between">
                <SkeletonText className="h-3 w-14" />
                <SkeletonText className="h-3 w-8" />
              </div>
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <SkeletonText className="h-3 w-16" />
                <SkeletonText className="h-3 w-8" />
              </div>
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <SkeletonText className="h-3 w-16" />
                <SkeletonText className="h-3 w-8" />
              </div>
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Top Movers (30d)</h3>
        {widgetsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-200 motion-safe:animate-pulse motion-reduce:animate-none dark:bg-gray-700" />
                <div className="min-w-0 flex-1 space-y-1">
                  <SkeletonText className="h-3 w-32" />
                  <SkeletonText className="h-2 w-20" />
                </div>
                <div className="shrink-0">
                  <SkeletonText className="h-3 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : (props.widgets?.topMovers?.length ?? 0) > 0 ? (
          <div className="space-y-3">
            {(props.widgets?.topMovers ?? []).slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-right text-xs font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => props.onOpenMaterialAction(item.id)}
                    className="block truncate text-left text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    {item.name}
                  </button>
                  <span className="font-mono text-[10px] text-gray-400">{item.partNumber}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.totalMovement}</span>
                  <div className="text-[10px] text-gray-400">
                    <span className="text-green-500">{item.inbound}</span>
                    <span className="px-1 text-gray-400">/</span>
                    <span className="text-orange-500">{item.outbound}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">No movement data</p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">PO Breakdown</h3>
        {widgetsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between">
                  <SkeletonText className="h-3 w-20" />
                  <SkeletonText className="h-3 w-6" />
                </div>
                <SkeletonBox className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : poSummary && Object.keys(poSummary).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(poSummary).map(([status, count]) => (
              <div key={status}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="capitalize text-gray-500 dark:text-gray-400">{status.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all ${poStatusColors[status] || "bg-gray-400"}`}
                    style={{
                      width: `${(count / Math.max(totalPOs, 1)) * 100}%`,
                      minWidth: count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">No PO data</p>
        )}
      </div>
    </div>
  );
}
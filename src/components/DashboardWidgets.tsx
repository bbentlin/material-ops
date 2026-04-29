"use client";

import type { WidgetData } from "@/types/dashboard";

type Props = {
  widgets: WidgetData | null;
  onOpenMaterialAction: (materialId: string) => void;
};

export default function DashboardWidgets(props: Props) {
  const poSummary = props.widgets?.poSummary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Inventory Health Gauge */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Inventory Health</h3>
        {props.widgets?.inventoryHealth ? (
          <>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${props.widgets.inventoryHealth.healthPercent} ${100 - props.widgets.inventoryHealth.healthPercent}`}
                  strokeLinecap="round"
                  className={
                    props.widgets.inventoryHealth.healthPercent >= 80
                      ? "text-green-500 stroke-current"
                      : props.widgets.inventoryHealth.healthPercent >= 50
                      ? "text-yellow-500 stroke-current"
                      : "text-red-500 stroke-current"
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {props.widgets.inventoryHealth.healthPercent}%
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" /> Healthy
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{props.widgets.inventoryHealth.healthy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" /> Low
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{props.widgets.inventoryHealth.low}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" /> Critical
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{props.widgets.inventoryHealth.critical}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        )}
      </div>

      {/* Stock Velocity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Stock Velocity</h3>
        {props.widgets?.stockVelocity ? (
          <>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Inbound</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{props.widgets.stockVelocity.totalInbound}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.min(
                        (props.widgets.stockVelocity.totalInbound /
                          Math.max(
                            props.widgets.stockVelocity.totalInbound,
                            props.widgets.stockVelocity.totalOutbound,
                            1
                          )) * 100,
                        100
                      )}%`,
                      minWidth: props.widgets.stockVelocity.totalInbound > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Outbound</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">{props.widgets.stockVelocity.totalOutbound}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all"
                    style={{
                      width: `${Math.min(
                        (props.widgets.stockVelocity.totalOutbound /
                          Math.max(
                            props.widgets.stockVelocity.totalInbound,
                            props.widgets.stockVelocity.totalOutbound,
                            1
                          )) * 100,
                        100
                      )}%`,
                      minWidth: props.widgets.stockVelocity.totalOutbound > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Transfers</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{props.widgets.stockVelocity.totalTransfers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${Math.min(
                        (props.widgets.stockVelocity.totalTransfers /
                          Math.max(
                            props.widgets.stockVelocity.totalInbound,
                            props.widgets.stockVelocity.totalOutbound,
                            1
                          )) * 100,
                        100
                      )}%`,
                      minWidth: props.widgets.stockVelocity.totalTransfers > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              Last {props.widgets.stockVelocity.periodDays} days
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        )}
      </div>

      {/* Top Movers */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Movers (30d)</h3>
        {props.widgets?.topMovers && props.widgets.topMovers.length > 0 ? (
          <div className="space-y-3">
            {props.widgets.topMovers.slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => props.onOpenMaterialAction(item.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline truncate block"
                  >
                    {item.name}
                  </button>
                  <span className="text-[10px] text-gray-400 font-mono">{item.partNumber}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.totalMovement}</span>
                  <div className="text-[10px] text-gray-400">
                    <span className="text-green-500">{item.inbound}</span>
                    <span className="text-orange-500">{item.outbound}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No movement data</p>
        )}
      </div>

      {/* PO Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">PO Breakdown</h3>
        {poSummary && Object.keys(poSummary).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(poSummary).map(([status, count]) => {
              const total = Object.values(poSummary).reduce((a, b) => a + b, 0);
              const colors: Record<string, string> = {
                DRAFT: "bg-gray-400",
                SUBMITTED: "bg-blue-500",
                APPROVED: "bg-green-500",
                PARTIALLY_RECEIVED: "bg-yellow-500",
                RECEIVED: "bg-emerald-600",
                CANCELLED: "bg-red-500",
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-500 dark:text-gray-400 capitalize">
                      {status.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full ${colors[status] || "bg-gray-400"} transition-all`}
                      style={{
                        width: `${(count / Math.max(total, 1)) * 100}%`,
                        minWidth: count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No PO data</p>
        )}
      </div>
    </div>
  );
}
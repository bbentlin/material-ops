"use client";

import type { TrendDay } from "@/types/dashboard";

type DeptStock = { name: string; color: string; total: number };

type Props = {
  stockByDepartment: DeptStock[];
  maxDeptStock: number;
  movementTrend: TrendDay[];
  maxTrend: number;
};

export default function DashboardCharts(props: Props) {
  const safeMaxDeptStock = Math.max(1, props.maxDeptStock);
  const safeMaxTrend = Math.max(1, props.maxTrend);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Stock by Department</h3>

        {props.stockByDepartment.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No stock data</p>
        ) : (
          <div>
            {props.stockByDepartment.map((dept) => {
              const widthPct = Math.max(0, Math.min(100, (dept.total / safeMaxDeptStock) * 100));

              return (
                <div key={dept.name} className="grid grid-cols-1 gap-1 sm:grid-cols-[7rem_1fr_4rem] sm:items-center sm:gap-3">
                  <span
                    className="truncate text-xs text-gray-600 dark:text-gray-200 sm:text-right"
                    title={dept.name}
                  >
                    {dept.name}
                  </span>

                  <div className="h-5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full transtition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: dept.color,
                        minWidth: dept.total > 0 ? "2px" : "0",
                      }}
                    />
                  </div>

                  <span className="text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {dept.total.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Movement Trends (14 days)</h3>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> Inbound
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-orange-400" /> Outbound
          </span>
        </div>

        {props.movementTrend.length === 0 || props.movementTrend.every((t) => t.inbound === 0 && t.outbound === 0) ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-300">No movements in the last 14 days</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex h-40 min-w-130 items-end gap-1">
              {props.movementTrend.map((day, i) => {
                const inboundPct = Math.max(0, Math.min(100, (day.inbound / safeMaxTrend) * 100));
                const outboundPct = Math.max(0, Math.min(100, (day.outbound / safeMaxTrend) * 100));

                return (
                  <div key={i} className="flex h-full min-w-7.5 flex-1 flex-col items-center justify-end gap-0.5">
                    <div
                      className="w-full rounded-t bg-green-500 transition-all duration-500"
                      style={{
                        height: `${inboundPct}%`,
                        minHeight: day.inbound > 0 ? "2px" : "0",
                      }}
                      title={`${day.label}: ${day.inbound} inbound`}
                    />
                    <div
                      className="w-full rounded-t bg-orange-400 transition-all duration-500"
                      style={{
                        height: `${outboundPct}%`,
                        minHeight: day.outbound > 0 ? "2px" : "0",
                      }}
                      title={`${day.label}: ${day.outbound} outbound`}
                    />
                    <span className="mb-1 truncate text-[9px] leading-none text-gray-400">
                      {i % 2 === 0 ? day.label : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
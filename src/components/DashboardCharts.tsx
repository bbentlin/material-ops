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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Stock by Department */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Stock by Department</h3>
        {props.stockByDepartment.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No stock data</p>
        ) : (
          <div className="space-y-3">
            {props.stockByDepartment.map((dept) => (
              <div key={dept.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-200 w-24 truncate text-right" title={dept.name}>
                  {dept.name}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(dept.total / props.maxDeptStock) * 100}%`,
                      backgroundColor: dept.color,
                      minWidth: "2px",
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 w-12 text-right">
                  {dept.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movement Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Movement Trends (14 days)</h3>
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> Inbound
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-orange-400" /> Outbound
          </span>
        </div>
        {props.movementTrend.length === 0 || props.movementTrend.every((t) => t.inbound === 0 && t.outbound === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-300 py-8 text-center">No movements in the last 14 days</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {props.movementTrend.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                <div
                  className="w-full rounded-t bg-green-500 transition-all duration-500"
                  style={{ height: `${(day.inbound / props.maxTrend) * 100}%`, minHeight: day.inbound > 0 ? "2px" : "0" }}
                  title={`${day.label}: ${day.inbound} inbound`}
                />
                <div
                  className="w-full rounded-t bg-orange-400 transition-all duration-500"
                  style={{ height: `${(day.outbound / props.maxTrend) * 100}%`, minHeight: day.outbound > 0 ? "2px" : "0" }}
                  title={`${day.label}: ${day.outbound} outbound`}
                />
                <span className="text-[9px] text-gray-400 mb-1 leading-none whitespace-nowrap overflow-hidden">
                  {i % 2 === 0 ? day.label : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
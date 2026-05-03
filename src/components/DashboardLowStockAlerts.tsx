"use client";

import type { LowStockAlert } from "@/types/dashboard";

type Props = {
  lowStockAlerts: LowStockAlert[];
  showAlerts: boolean;
  criticalCount: number;
  canEdit: boolean;
  onToggleShowAlertsAction: () => void;
  onOpenMaterialAction: (materialId: string) => void;
  onRestockAction: (materialId: string) => void;
};

export default function DashboardLowStockAlerts(props: Props) {
  if (props.lowStockAlerts.length === 0) return null;

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 overflow-hidden">
      <button
        onClick={props.onToggleShowAlertsAction}
        className="w-full p-4 flex items-center justify-between hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Low Stock Alerts
          </h3>
          <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
            {props.lowStockAlerts.length} item{props.lowStockAlerts.length !== 1 ? "s" : ""}
          </span>
          {props.criticalCount > 0 && (
            <span className="text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
              {props.criticalCount} critical
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{props.showAlerts ? "▲ Hide" : "▼ Show"}</span>
      </button>
      
      {props.showAlerts && (
        <div className="border-t border-orange-100 dark:border-orange-900/30">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {props.lowStockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-5 py-3 flex items-center gap-4 ${
                  alert.severity === "CRITICAL" ? "bg-red-50/50 dark:bg-red-900/10" : ""
                }`}
              >
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                  }`}
                >
                  {alert.severity === "CRITICAL" ? "CRITICAL" : "LOW"}
                </span>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => props.onOpenMaterialAction(alert.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline truncate block"
                  >
                    {alert.name}
                  </button>
                  <span className="text-xs text-gray-400 font-mono">{alert.partNumber}</span>
                </div>

                <div className="w-32 shrink-0">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span
                      className={`font-bold ${
                        alert.severity === "CRITICAL"
                          ? "text-red-600 dark:text-red-400"
                          : "text-organge-600 dark:text-orange-400"
                      }`}
                    >
                      {alert.quantity}
                    </span>
                    <span className="text-gray-400">
                      / {alert.minQuantity} {alert.unit} 
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        alert.severity === "CRITICAL" ? "bg-red-500" : "bg-orange-400"
                      }`}
                      style={{
                        width: `${Math.min(alert.percentOfThreshold, 100)}%`,
                        minWidth: alert.quantity > 0 ? "2px" : "0",
                      }}
                    />
                  </div>
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 w-20 text-right">
                  Need {alert.deficit} more
                </span>

                <span className="shrink-0">
                  {alert.department ? (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: alert.department.color }}
                    >
                      {alert.department.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </span>

                {props.canEdit && (
                  <button
                    onClick={() => props.onRestockAction(alert.id)}
                    className="text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors shrink-0"
                  >
                    + Restock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import type { AuditEntry } from "@/types/dashboard";

type Props = {
  auditLogs: AuditEntry[];
  formatAuditAction: (entry: AuditEntry) => { icon: string; label: string; color: string };
  getAuditDetailAction: (entry: AuditEntry) => string | null;
  onViewAllAction: () => void;
};

export default function DashboardActivityFeed(props: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        <button
          onClick={props.onViewAllAction}
          className="shrink-0 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          View All →
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {props.auditLogs.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400">No activity yet</div>
        ) : (
          props.auditLogs.map((entry) => {
            const { icon, label, color } = props.formatAuditAction(entry);
            const detail = props.getAuditDetailAction(entry);

            return (
              <div
                key={entry.id}
                className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <span className={`text-sm ${color}`}>{label}</span>
                      {detail && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 break-words">
                          {detail}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 sm:ml-auto">
                    <span className="truncate max-w-[10rem]">{entry.user?.name || "System"}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {new Date(entry.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
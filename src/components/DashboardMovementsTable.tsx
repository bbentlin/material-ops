"use client";

import type { Movement } from "@/types/dashboard";

type Props = {
  movements: Movement[];
  hasAnyFilter: boolean;
  totalMovements: number;
  movementsPerPage: number;
  movementPage: number;
  totalMovementPages: number;
  onPageChangeAction: (page: number) => void;
};

function TypePill({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
        type === "INBOUND"
          ? "bg-green-100 text-green-700"
          : type === "OUTBOUND"
          ? "bg-orange-100 text-orange-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {type}
    </span>
  );
}

export default function DashboardMovementsTable(props: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Movements</h2>
      </div>

      <div className="md:hidden p-4 space-y-3">
        {props.movements.map((mov) => (
          <div
            key={mov.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                  {mov.material.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 break-all">
                  {mov.material.partNumber}
                </div>
              </div>
              <TypePill type={mov.type} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Quantity</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{mov.quantity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">By</div>
                <div className="text-gray-800 dark:text-gray-200 wrap-break-word">{mov.user.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                <div className="text-gray-800 dark:text-gray-200">
                  {new Date(mov.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                <div className="text-gray-800 dark:text-gray-200">
                  {new Date(mov.createdAt).toLocaleDateString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Note</div>
                <div>{mov.note || "-"}</div>
              </div>
            </div>
          </div>
        ))}

        {props.movements.length === 0 && (
          <div className="px-2 py-10 text-center text-gray-400">
            {props.hasAnyFilter
              ? "No movements matching your filters."
              : "No movements yet. Record inbound or outbound stock above."}
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Qty</th>
              <th className="px-5 py-3">Note</th>
              <th className="px-5 py-3">By</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {props.movements.map((mov) => (
              <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-200">
                  {new Date(mov.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-300">
                  {mov.material.name}
                </td>
                <td className="px-5 py-4">
                  <TypePill type={mov.type} />
                </td>
                <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-300">{mov.quantity}</td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-300">{mov.note}</td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-300">{mov.user.name}</td>
              </tr>
            ))}

            {props.movements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  {props.hasAnyFilter
                    ? "No movements matching your filters."
                    : "No movements yet. Record inbound or outbound stock above."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {props.totalMovements > props.movementsPerPage && (
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 text-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Showing {(props.movementPage - 1) * props.movementsPerPage + 1}-
              {Math.min(props.movementPage * props.movementsPerPage, props.totalMovements)} of{" "}
              {props.totalMovements}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => props.onPageChangeAction(Math.max(1, props.movementPage - 1))}
                disabled={props.movementPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Page {props.movementPage} of {props.totalMovementPages}
              </span>
              <button
                onClick={() =>
                  props.onPageChangeAction(
                    Math.min(props.totalMovementPages, props.movementPage + 1)
                  )
                }
                disabled={props.movementPage === props.totalMovementPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
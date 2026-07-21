"use client";

import type { Material, SortKey } from "@/types/dashboard";

type Props = {
  materials: Material[];
  lowStockOnly: boolean;
  hasAnyFilter: boolean;
  canEdit: boolean;
  totalMaterials: number;
  materialsPerPage: number;
  materialPage: number;
  totalMaterialPages: number;
  sortIndicatorAction: (key: SortKey) => "none" | "asc" | "desc";
  onToggleSortAction: (key: SortKey) => void;
  onExportCSVAction: () => void;
  onImportCSVAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddMaterialAction: () => void;
  onClearLowStockAction: () => void;
  onOpenMaterialAction: (id: string) => void;
  onEditMaterialAction: (mat: Material) => void;
  onInboundAction: (id: string) => void;
  onOutboundAction: (id: string) => void;
  onTransferAction: (id: string) => void;
  onPageChangeAction: (page: number) => void;
};

function SortIndicator({ s }: { s: "none" | "asc" | "desc" }) {
  if (s === "none") return <span className="ml-1 text-gray-300">↕</span>;
  return <span className="ml-1">{s === "asc" ? "↑" : "↓"}</span>;
}

export default function DashboardMaterialsTable(props: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Materials</h2>
          {props.lowStockOnly && (
            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              ⚠️ Low stock only
              <button
                onClick={props.onClearLowStockAction}
                className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
              >
                ✕
              </button>
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={props.onExportCSVAction}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            ↓ Export CSV
          </button>
          {props.canEdit && (
            <>
              <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-900">
                ↑ Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={props.onImportCSVAction}
                  className="hidden"
                />
              </label>
              <button
                onClick={props.onAddMaterialAction}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                + Add Material
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 p-4 md:hidden">
        {props.materials.map((mat) => (
          <div
            key={mat.id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">{mat.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{mat.partNumber}</div>
              </div>
              {mat.quantity < (mat.minQuantity ?? 10) && (
                <span className="inline-block shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  Low
                </span>
              )}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Quantity</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">{mat.quantity}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Unit</span>
                <div className="text-gray-700 dark:text-gray-300">{mat.unit || "—"}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
                <div className="text-gray-700 dark:text-gray-300">{mat.location || "—"}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Department</span>
                <div className="text-gray-700 dark:text-gray-300">{mat.department?.name || "—"}</div>
              </div>
            </div>

            {mat.description && (
              <div className="mb-3 border-t border-gray-200 pt-2 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{mat.description}</p>
              </div>
            )}

            {props.canEdit && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => props.onEditMaterialAction(mat)}
                  className="flex-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => props.onInboundAction(mat.id)}
                  className="flex-1 rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  Inbound
                </button>
                <button
                  onClick={() => props.onOutboundAction(mat.id)}
                  className="flex-1 rounded px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  Outbound
                </button>
                <button
                  onClick={() => props.onTransferAction(mat.id)}
                  className="flex-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  Transfer
                </button>
              </div>
            )}
          </div>
        ))}

        {props.materials.length === 0 && (
          <div className="px-2 py-10 text-center text-gray-400">
            {props.hasAnyFilter
              ? "No materials matching your filters."
              : "No materials yet. Create one to get started."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => props.onToggleSortAction("name")}
              >
                Name
                <SortIndicator s={props.sortIndicatorAction("name")} />
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => props.onToggleSortAction("partNumber")}
              >
                Part Number
                <SortIndicator s={props.sortIndicatorAction("partNumber")} />
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => props.onToggleSortAction("quantity")}
              >
                Quantity
                <SortIndicator s={props.sortIndicatorAction("quantity")} />
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => props.onToggleSortAction("unit")}
              >
                Unit
                <SortIndicator s={props.sortIndicatorAction("unit")} />
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => props.onToggleSortAction("location")}
              >
                Location
                <SortIndicator s={props.sortIndicatorAction("location")} />
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => props.onToggleSortAction("department")}
              >
                Department
                <SortIndicator s={props.sortIndicatorAction("department")} />
              </th>
              {props.canEdit && <th className="px-5 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {props.materials.map((mat) => (
              <tr
                key={mat.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td
                  className="cursor-pointer px-5 py-4 font-medium text-gray-900 dark:text-gray-100"
                  onClick={() => props.onOpenMaterialAction(mat.id)}
                >
                  {mat.name}
                </td>
                <td
                  className="cursor-pointer px-5 py-4 font-mono text-sm text-gray-600 dark:text-gray-300"
                  onClick={() => props.onOpenMaterialAction(mat.id)}
                >
                  {mat.partNumber}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      mat.quantity < (mat.minQuantity ?? 10)
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    }`}
                  >
                    {mat.quantity}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{mat.unit || "—"}</td>
                <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{mat.location || "—"}</td>
                <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {mat.department?.name || "—"}
                </td>
                {props.canEdit && (
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => props.onEditMaterialAction(mat)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => props.onInboundAction(mat.id)}
                        className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        In
                      </button>
                      <button
                        onClick={() => props.onOutboundAction(mat.id)}
                        className="text-xs font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        Out
                      </button>
                      <button
                        onClick={() => props.onTransferAction(mat.id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Transfer
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {props.materials.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-400">
            {props.hasAnyFilter
              ? "No materials matching your filters."
              : "No materials yet. Create one to get started."}
          </div>
        )}
      </div>

      {/* Pagination */}
      {props.totalMaterialPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {props.materialPage} of {props.totalMaterialPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => props.onPageChangeAction(props.materialPage - 1)}
              disabled={props.materialPage === 1}
              className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              ← Previous
            </button>
            <button
              onClick={() => props.onPageChangeAction(props.materialPage + 1)}
              disabled={props.materialPage === props.totalMaterialPages}
              className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
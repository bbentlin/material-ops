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
  if (s === "none") return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="ml-1">{s === "asc" ? "↑" : "↓"}</span>
}

export default function DashboardMaterialsTable(props: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Materials</h2>
          {props.lowStockOnly && (
            <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              ⚠️ Low stock only
              <button
                onClick={props.onClearLowStockAction}
                className="hover:text-orange-900 dark:hover:text-orange-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={props.onExportCSVAction}
            className="text-sm font-medium text-gray-600 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            ↓ Export CSV
          </button>
          {props.canEdit && (
            <>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
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
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
              >
                + Add Material
              </button>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => props.onToggleSortAction("name")}>
                Name<SortIndicator s={props.sortIndicatorAction("name")} />
              </th>
              <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => props.onToggleSortAction("partNumber")}>
                Part Number<SortIndicator s={props.sortIndicatorAction("partNumber")} />
              </th>
              <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => props.onToggleSortAction("quantity")}>
                Quantity<SortIndicator s={props.sortIndicatorAction("quantity")} />
              </th>
              <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => props.onToggleSortAction("unit")}>
                Unit<SortIndicator s={props.sortIndicatorAction("unit")} />
              </th>
              <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => props.onToggleSortAction("location")}>
                Location<SortIndicator s={props.sortIndicatorAction("location")} />
              </th>
              <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => props.onToggleSortAction("department")}>
                Department<SortIndicator s={props.sortIndicatorAction("department")} />
              </th>
              {props.canEdit && <th className="px-5 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {props.materials.map((mat) => (
              <tr key={mat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-4">
                  <button
                    onClick={() => props.onOpenMaterialAction(mat.id)}
                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline text-left"
                  >
                    {mat.name}
                  </button>
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{mat.partNumber}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${
                      mat.quantity <= (mat.minQuantity ?? 10)
                        ? mat.quantity === 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                    }`}
                  >
                    {mat.quantity}
                    {mat.quantity <= (mat.minQuantity ?? 10) && (
                      <span className={`text-xs ml-1 ${mat.quantity === 0 ? "text-red-500" : "text-orange-500"}`}>
                        (min: {mat.quantity ?? 10})
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{mat.unit}</td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{mat.location}</td>
                <td className="px-5 py-4">
                  {mat.department? (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: mat.department.color }}
                    >
                      {mat.department.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                {props.canEdit && (
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => props.onEditMaterialAction(mat)}
                        className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => props.onInboundAction(mat.id)}
                        className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
                      >
                        + Inbound
                      </button>
                      <button
                        onClick={() => props.onOutboundAction(mat.id)}
                        className="text-sm font-medium bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-400 transition-colors"
                      >
                        - Outbound
                      </button>
                      <button
                        onClick={() => props.onTransferAction(mat.id)}
                        className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors"
                      >
                        🔄 Transfer
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {props.materials.length === 0 && (
              <tr>
                <td
                  colSpan={props.canEdit ? 7 : 6}
                  className="px-5 py-12 text-center text-gray-400"
                >
                  {props.hasAnyFilter
                    ? "No materials matching your filters"
                    : 'No materials yet. Click "+ Add Material" to get started.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalMaterials > props.materialsPerPage && (
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Showing {(props.materialPage - 1) * props.materialsPerPage + 1}-
            {Math.min(props.materialPage * props.materialsPerPage, props.totalMaterials)} of{" "}
            {props.totalMaterials}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => props.onPageChangeAction(Math.max(1, props.materialPage - 1))}
              disabled={props.materialPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Page {props.materialPage} of {props.totalMaterialPages}
            </span>
            <button
              onClick={() => props.onPageChangeAction(Math.min(props.totalMaterialPages, props.materialPage + 1))}
              disabled={props.materialPage === props.totalMaterialPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import AddMaterialModal from "@/components/AddMaterialModal";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";
import TransferModal from "@/components/TransferModal";
import ScannerModal from "@/components/ScannerModal";
import Toast from "@/components/Toast";
import { useDashboard } from "@/hooks/useDashboard";
import type { SortKey } from "@/types/dashboard";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStatsCards from "@/components/DashboardStatsCards";
import DashboardWidgets from "@/components/DashboardWidgets";
import DashboardLowStockAlerts from "@/components/DashboardLowStockAlerts";
import DashboardCharts from "@/components/DashboardCharts";

export default function DashboardPage() {
  const d = useDashboard();

  function sortIndicator(key: SortKey) {
    const s = d.sortIndicator(key);
    if (s === "none") return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{s === "asc" ? "↑" : "↓"}</span>;
  }

  if (d.loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      
      <DashboardHeader
        search={d.search}
        setSearchAction={d.setSearch}
        dateFrom={d.dateFrom}
        setDateFromAction={d.setDateFrom}
        dateTo={d.dateTo}
        setDateToAction={d.setDateTo}
        hasDateFilter={d.hasDateFilter}
        departmentFilter={d.departmentFilter}
        setDepartmentFilterAction={d.setDepartmentFilter}
        departments={d.departments}
        userName={d.userName}
        userRole={d.userRole}
        roleBadge={d.roleBadge}
        canManageUsers={d.canManageUsers}
        setShowScannerAction={d.setShowScanner}
        onOpenOrdersAction={() => d.router.push("/dashboard/purchase-orders")}
        onOpenUsersAction={() => d.router.push("/admin")}
        onLogoutAction={d.handleLogout}
        darkMode={d.darkMode}
        onToggleDarkModeAction={d.toggleDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {d.error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            {d.error}
          </div>
        )}

        {/* Read-only banner for viewers */}
        {d.userRole === "VIEWER" && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <span className="text-lg">👁️</span>
            <span>
              You have <strong>view-only</strong> access. Contact an administrator to
              request edit permissions.
            </span>
          </div>
        )}

        {/* Search results indicator */}
        {d.hasAnyFilter && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>
              Showing {d.totalMaterials} material
              {d.totalMaterials !== 1 ? "s" : ""} and{" "}
              {d.totalMovements} movement
              {d.totalMovements !== 1 ? "s" : ""}
              {d.debouncedSearch && (
                <>
                  {" "}
                  matching &ldquo;
                  <span className="font-medium text-gray-700 dark:text-gray-200">{d.debouncedSearch}</span>
                  &rdquo;
                </>
              )}
              {d.hasDateFilter && (
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  {d.dateFrom && d.dateTo
                    ? `from ${d.dateFrom} to ${d.dateTo}`
                    : d.dateFrom
                    ? `from ${d.dateFrom}`
                    : `up to ${d.dateTo}`}
                </span>
              )}
              {d.lowStockOnly && (
                <span className="text-orange-600 dark:text-orange-400 font-medium"> — low stock only</span>
              )}
            </span>
            <button
              onClick={d.clearFilters}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"
            >
              Clear all filters
            </button>
          </div>
        )}

        <DashboardStatsCards
          stats={d.stats}
          widgets={d.widgets}
          lowStockOnly={d.lowStockOnly}
          criticalCount={d.criticalCount}
          lowCount={d.lowCount}
          onToggleLowStockAction={() => {
            d.setLowStockOnly((prev) => !prev);
            d.setMaterialPage(1);
          }}
        />

        <DashboardWidgets
          widgets={d.widgets}
          onOpenMaterialAction={(id) => d.router.push(`/dashboard/materials/${id}`)}
        />

        <DashboardLowStockAlerts
          lowStockAlerts={d.lowStockAlerts}
          showAlerts={d.showAlerts}
          criticalCount={d.criticalCount}
          canEdit={d.canEdit}
          onToggleShowAlertsAction={() => d.setShowAlerts((prev) => !prev)}
          onOpenMaterialAction={(id) => d.router.push(`/dashboard/materials/${id}`)}
          onRestockAction={(id) => d.setShowMovement(id)}
        />

        <DashboardCharts
          stockByDepartment={d.stockByDepartment}
          maxDeptStock={d.maxDeptStock}
          movementTrend={d.movementTrend}
          maxTrend={d.maxTrend}
        />

        {/* Materials Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Materials</h2>
              {d.lowStockOnly && (
                <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⚠️ Low stock only
                  <button
                    onClick={() => d.setLowStockOnly(false)}
                    className="hover:text-orange-900 dark:hover:text-orange-100 ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={d.exportCSV}
                className="text-sm font-medium text-gray-600 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                ↓ Export CSV
              </button>
              {d.canEdit && (
                <>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    ↑ Import CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={d.handleImportCSV}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => d.setShowAddMaterial(true)}
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
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => d.toggleSort("name")}>
                    Name{sortIndicator("name")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => d.toggleSort("partNumber")}>
                    Part Number{sortIndicator("partNumber")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => d.toggleSort("quantity")}>
                    Quantity{sortIndicator("quantity")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => d.toggleSort("unit")}>
                    Unit{sortIndicator("unit")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => d.toggleSort("location")}>
                    Location{sortIndicator("location")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => d.toggleSort("department")}>
                    Department{sortIndicator("department")}
                  </th>
                  {d.canEdit && <th className="px-5 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {d.materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <button
                        onClick={() => d.router.push(`/dashboard/materials/${mat.id}`)}
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
                            (min: {mat.minQuantity ?? 10})
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{mat.unit}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{mat.location}</td>
                    <td className="px-5 py-4">
                      {mat.department ? (
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
                    {d.canEdit && (
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => d.setEditMaterial(mat)}
                            className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => d.setShowMovement(mat.id)}
                            className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
                          >
                            + Inbound
                          </button>
                          <button
                            onClick={() => d.setShowMovement(`out-${mat.id}`)}
                            className="text-sm font-medium bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-400 transition-colors"
                          >
                            - Outbound
                          </button>
                          <button
                            onClick={() => d.setShowTransfer(mat.id)}
                            className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors"
                          >
                            🔄 Transfer
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {d.materials.length === 0 && (
                  <tr>
                    <td
                      colSpan={d.canEdit ? 7 : 6}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      {d.hasAnyFilter
                        ? "No materials matching your filters"
                        : 'No materials yet. Click "+ Add Material" to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {d.totalMaterials > d.materialsPerPage && (
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Showing {(d.materialPage - 1) * d.materialsPerPage + 1}–
                {Math.min(d.materialPage * d.materialsPerPage, d.totalMaterials)} of{" "}
                {d.totalMaterials}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => d.setMaterialPage((p) => Math.max(1, p - 1))}
                  disabled={d.materialPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {d.materialPage} of {d.totalMaterialPages}
                </span>
                <button
                  onClick={() => d.setMaterialPage((p) => Math.min(d.totalMaterialPages, p + 1))}
                  disabled={d.materialPage === d.totalMaterialPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Material</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {d.movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-200">
                      {new Date(mov.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-300">
                      {mov.material.name}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                          mov.type === "INBOUND"
                            ? "bg-green-100 text-green-700"
                            : mov.type === "OUTBOUND"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-300">{mov.quantity}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-300">{mov.note || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-300">{mov.user.name}</td>
                  </tr>
                ))}
                {d.movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      {d.hasAnyFilter
                        ? "No movements matching your filters"
                        : "No movements yet. Record inbound or outbound stock above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {d.totalMovements > d.movementsPerPage && (
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Showing {(d.movementPage - 1) * d.movementsPerPage + 1}–
                {Math.min(d.movementPage * d.movementsPerPage, d.totalMovements)} of{" "}
                {d.totalMovements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => d.setMovementPage((p) => Math.max(1, p - 1))}
                  disabled={d.movementPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {d.movementPage} of {d.totalMovementPages}
                </span>
                <button
                  onClick={() => d.setMovementPage((p) => Math.min(d.totalMovementPages, p + 1))}
                  disabled={d.movementPage === d.totalMovementPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
            <button
              onClick={() => d.router.push("/dashboard/audit-log")}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {d.auditLogs.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400">No activity yet</div>
            ) : (
              d.auditLogs.map((entry) => {
                const { icon, label, color } = d.formatAuditAction(entry);
                const detail = d.getAuditDetail(entry);
                return (
                  <div key={entry.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <span className="text-lg shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${color}`}>{label}</span>
                      {detail && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{detail}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.user?.name || "System"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(entry.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Add Material Modal */}
      {d.showAddMaterial && d.canEdit && (
        <AddMaterialModal
          onCloseAction={() => d.setShowAddMaterial(false)}
          onSuccessAction={() => {
            d.setShowAddMaterial(false);
            d.refreshAll();
            d.addToast("Material added successfully");
          }}
        />
      )}

      {/* Edit Material Modal */}
      {d.editMaterial && d.canEdit && (
        <EditMaterialModal
          material={d.editMaterial}
          canDelete={d.canDelete}
          onCloseAction={() => d.setEditMaterial(null)}
          onSuccessAction={() => {
            d.setEditMaterial(null);
            d.refreshAll();
            d.addToast("Material updated successfully");
          }}
        />
      )}

      {/* Movement Modal */}
      {d.showMovement && d.canEdit && (
        <MovementModal
          materialId={d.showMovement.replace("out-", "")}
          type={d.showMovement.startsWith("out-") ? "OUTBOUND" : "INBOUND"}
          onCloseAction={() => d.setShowMovement(null)}
          onSuccessAction={() => {
            d.setShowMovement(null);
            d.refreshAll();
            d.addToast(
              d.showMovement?.startsWith("out-")
                ? "Outbound recorded"
                : "Inbound recorded"
            );
          }}
        />
      )}

      {/* Transfer Modal */}
      {d.showTransfer && d.canEdit && (
        <TransferModal
          sourceMaterialId={d.showTransfer}
          onCloseAction={() => d.setShowTransfer(null)}
          onSuccessAction={() => {
            d.setShowTransfer(null);
            d.refreshAll();
            d.addToast("Transfer completed");
          }}
        />
      )}

      {/* Scanner Modal */}
      {d.showScanner && (
        <ScannerModal
          onCloseAction={() => d.setShowScanner(false)}
          onResultAction={d.handleScanResult}
        />
      )}

      <Toast messages={d.toasts} onDismissAction={d.dismissToast} />
    </div>
  );
}
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
import DashboardMaterialsTable from "@/components/DashboardMaterialsTable";
import DashboardMovementsTable from "@/components/DashboardMovementsTable";

export default function DashboardPage() {
  const d = useDashboard();

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

        <DashboardMaterialsTable
          materials={d.materials}
          lowStockOnly={d.lowStockOnly}
          hasAnyFilter={d.hasAnyFilter}
          canEdit={d.canEdit}
          totalMaterials={d.totalMaterials}
          materialsPerPage={d.materialsPerPage}
          materialPage={d.materialPage}
          totalMaterialPages={d.totalMaterialPages}
          sortIndicatorAction={d.sortIndicator}
          onToggleSortAction={d.toggleSort}
          onExportCSVAction={d.exportCSV}
          onImportCSVAction={d.handleImportCSV}
          onAddMaterialAction={() => d.setShowAddMaterial(true)}
          onClearLowStockAction={() => d.setLowStockOnly(false)}
          onOpenMaterialAction={(id) => d.router.push(`/dashboard/materials/${id}`)}
          onEditMaterialAction={(mat) => d.setEditMaterial(mat)}
          onInboundAction={(id) => d.setShowMovement(id)}
          onOutboundAction={(id) => d.setShowMovement(`out-${id}`)}
          onTransferAction={(id) => d.setShowTransfer(id)}
          onPageChangeAction={(page) => d.setMaterialPage(page)}
        />

        <DashboardMovementsTable
          movements={d.movements}
          hasAnyFilter={d.hasAnyFilter}
          totalMovements={d.totalMovements}
          movementsPerPage={d.movementsPerPage}
          movementPage={d.movementPage}
          totalMovementPages={d.totalMovementPages}
          onPageChangeAction={(page) => d.setMovementPage(page)}
        />

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
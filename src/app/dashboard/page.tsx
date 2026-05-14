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
import DashboardActivityFeed from "@/components/DashboardActivityFeed";
import DashboardSkeleton from "@/components/DashboardSkeleton";

export default function DashboardPage() {
  const d = useDashboard();

  const shouldCrashDashboard = 
    process.env.NEXT_PUBLIC_E2E_CRASH === "1" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("e2eCrashDashboard");

    if (shouldCrashDashboard) {
      throw new Error("E2E dashboard boundary crash");
    }

  if (d.loading) {
    return <DashboardSkeleton />;
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

        <DashboardActivityFeed
          auditLogs={d.auditLogs}
          formatAuditAction={d.formatAuditAction}
          getAuditDetailAction={d.getAuditDetail}
          onViewAllAction={() => d.router.push("/dashboard/audit-log")}
        />
        
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
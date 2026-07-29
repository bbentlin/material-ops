"use client";

import { useState } from "react";
import AddMaterialModal from "@/components/AddMaterialModal";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";
import TransferModal from "@/components/TransferModal";
import ScannerModal from "@/components/ScannerModal";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import Toast from "@/components/Toast";
import { useDashboard } from "@/hooks/useDashboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStatsCards from "@/components/DashboardStatsCards";
import DashboardWidgets from "@/components/DashboardWidgets";
import DashboardLowStockAlerts from "@/components/DashboardLowStockAlerts";
import DashboardCharts from "@/components/DashboardCharts";
import DashboardMaterialsTable from "@/components/DashboardMaterialsTable";
import DashboardMovementsTable from "@/components/DashboardMovementsTable";
import DashboardActivityFeed from "@/components/DashboardActivityFeed";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DashboardPage() {
  const d = useDashboard();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const shouldCrashDashboard =
    process.env.NEXT_PUBLIC_E2E_CRASH === "1" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("e2eCrashDashboard");

  if (shouldCrashDashboard) {
    throw new Error("E2E dashboard boundary crash");
  }

  const anyModalOpen = Boolean(
    d.showAddMaterial || d.editMaterial || d.showMovement || d.showTransfer || d.showScanner
  );

  useKeyboardShortcuts({
    enabled: !d.loading && !anyModalOpen && !showShortcutsHelp,
    onFocusSearch: () => {
      document.getElementById("dashboard-search")?.focus();
    },
    onNewMaterial: d.canEdit ? () => d.setShowAddMaterial(true) : undefined,
    onOpenScanner: () => d.setShowScanner(true),
    onOpenOrders: () => d.router.push("/dashboard/purchase-order"),
    onOpenUsers: d.canManageUsers ? () => d.router.push("/admin") : undefined,
    onToggleDarkMode: d.toggleDarkMode,
    onShowHelp: () => setShowShortcutsHelp(true),
  });

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
        onOpenOrdersAction={() => d.router.push("/dashboard/purchase-order")}
        onOpenUsersAction={() => d.router.push("/admin")}
        onLogoutAction={d.handleLogout}
        darkMode={d.darkMode}
        onToggleDarkModeAction={d.toggleDarkMode}
        onShowShortcutsAction={() => setShowShortcutsHelp(true)}
      />

      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {d.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 sm:mb-6 sm:p-4">
            {d.error}
          </div>
        )}

        {d.userRole === "VIEWER" && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 sm:mb-6 sm:items-center sm:p-4">
            <span className="text-base sm:text-lg">👁️</span>
            <span>
              You have <strong>view-only</strong> access. Contact an administrator to request edit permissions.
            </span>
          </div>
        )}

        {d.hasAnyFilter && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Showing {d.totalMaterials} material{d.totalMaterials !== 1 ? "s" : ""} and {d.totalMovements}{" "}
                  movement{d.totalMovements !== 1 ? "s" : ""}
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
                    <span className="font-medium text-orange-600 dark:text-orange-400"> - low stock only</span>
                  )}
                </span>
              </div>

              <button
                onClick={d.clearFilters}
                className="inline-flex w-full items-center justify-center rounded-md border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/20 sm:w-auto"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        <DashboardStatsCards
          stats={d.stats}
          widgets={d.widgets}
          lowStockOnly={d.lowStockOnly}
          criticalCount={d.criticalCount}
          lowCount={d.lowCount}
          onToggleLowStockAction={() => {
            d.setLowStockOnly(!d.lowStockOnly);
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

      {d.importPreview && (
        <ConfirmDialog
          title="Import Materials"
          message={`Import ${d.importPreview.length} material(s) from CSV?`}
          confirmLabel="Import"
          danger={false}
          onConfirmAction={d.confirmImportCSV}
          onCloseAction={() => d.setImportPreview(null)}
        />
      )}

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

      {d.showMovement && d.canEdit && (
        <MovementModal
          materialId={d.showMovement.replace("out-", "")}
          type={d.showMovement.startsWith("out-") ? "OUTBOUND" : "INBOUND"}
          onCloseAction={() => d.setShowMovement(null)}
          onSuccessAction={() => {
            d.setShowMovement(null);
            d.refreshAll();
            d.addToast(d.showMovement?.startsWith("out-") ? "Outbound recorded" : "Inbound recorded");
          }}
        />
      )}

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

      {d.showScanner && (
        <ScannerModal onCloseAction={() => d.setShowScanner(false)} onResultAction={d.handleScanResult} />
      )}

      {showShortcutsHelp && (
        <KeyboardShortcutsModal onCloseAction={() => setShowShortcutsHelp(false)} />
      )}

      <Toast messages={d.toasts} onDismissAction={d.dismissToast} />
    </div>
  );
}
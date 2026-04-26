"use client";

import AddMaterialModal from "@/components/AddMaterialModal";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";
import TransferModal from "@/components/TransferModal";
import ScannerModal from "@/components/ScannerModal";
import Toast from "@/components/Toast";
import { useDashboard } from "@/hooks/useDashboard";
import type { SortKey } from "@/types/dashboard";

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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 px-4">
            📦 LogiCore Inventory Management System
          </h1>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search materials, part numbers, locations..."
                value={d.search}
                onChange={(e) => d.setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {d.search && (
                <button
                  onClick={() => d.setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={d.dateFrom}
                onChange={(e) => d.setDateFrom(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="From date"
              />
              <span className="text-gray-400 dark:text-gray-100 text-sm">→</span>
              <input
                type="date"
                value={d.dateTo}
                onChange={(e) => d.setDateTo(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="To date"
              />
              {d.hasDateFilter && (
                <button
                  onClick={() => {
                    d.setDateFrom("");
                    d.setDateTo("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  title="Clear dates"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={d.departmentFilter}
              onChange={(e) => d.setDepartmentFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {d.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {/* User info + role badge */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-300 pl-4">
              {d.userName && (
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{d.userName}</span>
              )}
              {d.userRole && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    d.roleBadge[d.userRole] || "bg-gray-200 text-gray-600"
                  }`}
                >
                  {d.userRole}
                </span>
              )}
            </div>

            {/* Scanner */}
            <button
              onClick={() => d.setShowScanner(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
              title="Scan barcode or QR code"
            >
              📷 Scan
            </button>

            {/* Purchase Orders Link */}
            <button
              onClick={() => d.router.push("/dashboard/purchase-orders")}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
              title="Purchase Orders"
            >
              📋 Orders
            </button>

            {/* Admin link */}
            {d.canManageUsers && (
              <button
                onClick={() => d.router.push("/admin")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200/95 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 font-medium"
              >
                👥 Users
              </button>
            )}
            <button
              onClick={d.handleLogout}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Sign Out
            </button>
            <button
              onClick={d.toggleDarkMode}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={d.darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {d.darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Materials
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {d.stats?.totalMaterials ?? 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Stock
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {d.stats?.totalStock ?? 0}
            </div>
          </div>
          {/* Low Stock card — clickable to toggle filter */}
          <button
            onClick={() => {
              d.setLowStockOnly((prev) => !prev);
              d.setMaterialPage(1);
            }}
            className={`text-left bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 transition-all ${
              d.lowStockOnly
                ? "border-orange-400 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900"
                : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Low Stock
              </span>
              {(d.stats?.lowStockCount ?? 0) > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-600">
                {d.stats?.lowStockCount ?? 0}
              </span>
              {d.lowStockOnly && (
                <span className="text-xs text-orange-500 font-medium">Filter active</span>
              )}
            </div>
            {(d.stats?.lowStockCount ?? 0) > 0 && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {d.criticalCount > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-medium">{d.criticalCount} critical</span>
                )}
                {d.criticalCount > 0 && d.lowCount > 0 && " · "}
                {d.lowCount > 0 && (
                  <span className="text-orange-500 dark:text-orange-400">{d.lowCount} low</span>
                )}
                {" · Click to "}
                {d.lowStockOnly ? "show all" : "filter"}
              </div>
            )}
          </button>
          {/* Active POs card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Active POs
            </div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {d.widgets?.poSummary
                ? (d.widgets.poSummary["SUBMITTED"] ?? 0) +
                  (d.widgets.poSummary["APPROVED"] ?? 0) +
                  (d.widgets.poSummary["PARTIALLY_RECEIVED"] ?? 0)
                : 0}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {d.widgets?.poSummary?.["SUBMITTED"] ?? 0} submitted ·{" "}
              {d.widgets?.poSummary?.["APPROVED"] ?? 0} approved
            </div>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Inventory Health Gauge */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Inventory Health</h3>
            {d.widgets?.inventoryHealth ? (
              <>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      strokeWidth="3"
                      strokeDasharray={`${d.widgets.inventoryHealth.healthPercent} ${100 - d.widgets.inventoryHealth.healthPercent}`}
                      strokeLinecap="round"
                      className={
                        d.widgets.inventoryHealth.healthPercent >= 80
                          ? "text-green-500 stroke-current"
                          : d.widgets.inventoryHealth.healthPercent >= 50
                          ? "text-yellow-500 stroke-current"
                          : "text-red-500 stroke-current"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {d.widgets.inventoryHealth.healthPercent}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" /> Healthy
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{d.widgets.inventoryHealth.healthy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" /> Low
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{d.widgets.inventoryHealth.low}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" /> Critical
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{d.widgets.inventoryHealth.critical}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            )}
          </div>

          {/* Stock Velocity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Stock Velocity</h3>
            {d.widgets?.stockVelocity ? (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Inbound</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{d.widgets.stockVelocity.totalInbound}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${Math.min((d.widgets.stockVelocity.totalInbound / Math.max(d.widgets.stockVelocity.totalInbound, d.widgets.stockVelocity.totalOutbound, 1)) * 100, 100)}%`, minWidth: d.widgets.stockVelocity.totalInbound > 0 ? "4px" : "0" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Outbound</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">{d.widgets.stockVelocity.totalOutbound}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full rounded-full bg-orange-400 transition-all"
                        style={{ width: `${Math.min((d.widgets.stockVelocity.totalOutbound / Math.max(d.widgets.stockVelocity.totalInbound, d.widgets.stockVelocity.totalOutbound, 1)) * 100, 100)}%`, minWidth: d.widgets.stockVelocity.totalOutbound > 0 ? "4px" : "0" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Transfers</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{d.widgets.stockVelocity.totalTransfers}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min((d.widgets.stockVelocity.totalTransfers / Math.max(d.widgets.stockVelocity.totalInbound, d.widgets.stockVelocity.totalOutbound, 1)) * 100, 100)}%`, minWidth: d.widgets.stockVelocity.totalTransfers > 0 ? "4px" : "0" }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">Last {d.widgets.stockVelocity.periodDays} days</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            )}
          </div>

          {/* Top Movers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Movers (30d)</h3>
            {d.widgets?.topMovers && d.widgets.topMovers.length > 0 ? (
              <div className="space-y-3">
                {d.widgets.topMovers.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => d.router.push(`/dashboard/materials/${item.id}`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline truncate block"
                      >
                        {item.name}
                      </button>
                      <span className="text-[10px] text-gray-400 font-mono">{item.partNumber}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.totalMovement}</span>
                      <div className="text-[10px] text-gray-400">
                        <span className="text-green-500">{item.inbound}</span>
                        <span className="text-orange-500">{item.outbound}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No movement data</p>
            )}
          </div>

          {/* PO Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">PO Breakdown</h3>
            {d.widgets?.poSummary && Object.keys(d.widgets.poSummary).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(d.widgets.poSummary).map(([status, count]) => {
                  const total = Object.values(d.widgets!.poSummary).reduce((a, b) => a + b, 0);
                  const colors: Record<string, string> = {
                    DRAFT: "bg-gray-400",
                    SUBMITTED: "bg-blue-500",
                    APPROVED: "bg-green-500",
                    PARTIALLY_RECEIVED: "bg-yellow-500",
                    RECEIVED: "bg-emerald-600",
                    CANCELLED: "bg-red-500",
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {status.replace(/_/g, " ").toLowerCase()}
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-full rounded-full ${colors[status] || "bg-gray-400"} transition-all`}
                          style={{
                            width: `${(count / Math.max(total, 1)) * 100}%`,
                            minWidth: count > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No PO data</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Panel */}
        {d.lowStockAlerts.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 overflow-hidden">
            <button
              onClick={() => d.setShowAlerts((prev) => !prev)}
              className="w-full p-4 flex items-center justify-between hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Low Stock Alerts
                </h3>
                <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                  {d.lowStockAlerts.length} item{d.lowStockAlerts.length !== 1 ? "s" : ""}
                </span>
                {d.criticalCount > 0 && (
                  <span className="text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                    {d.criticalCount} critical
                  </span>
                )}
              </div>
              <span className="text-gray-400 text-sm">{d.showAlerts ? "▲ Hide" : "▼ Show"}</span>
            </button>
            {d.showAlerts && (
              <div className="border-t border-orange-100 dark:border-orange-900/30">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {d.lowStockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`px-5 py-3 flex items-center gap-4 ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-50/50 dark:bg-red-900/10"
                          : ""
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
                          onClick={() => d.router.push(`/dashboard/materials/${alert.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline truncate block"
                        >
                          {alert.name}
                        </button>
                        <span className="text-xs text-gray-400 font-mono">{alert.partNumber}</span>
                      </div>
                      <div className="w-32 shrink-0">
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className={`font-bold ${
                            alert.severity === "CRITICAL" ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                          }`}>
                            {alert.quantity}
                          </span>
                          <span className="text-gray-400">/ {alert.minQuantity} {alert.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-full rounded-full transition-all ${
                              alert.severity === "CRITICAL" ? "bg-red-500" : "bg-orange-400"
                            }`}
                            style={{ width: `${Math.min(alert.percentOfThreshold, 100)}%`, minWidth: alert.quantity > 0 ? "2px" : "0" }}
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
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </span>
                      {d.canEdit && (
                        <button
                          onClick={() => d.setShowMovement(alert.id)}
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
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stock by Department */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Stock by Department</h3>
            {d.stockByDepartment.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No stock data</p>
            ) : (
              <div className="space-y-3">
                {d.stockByDepartment.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-200 w-24 truncate text-right" title={dept.name}>
                      {dept.name}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(dept.total / d.maxDeptStock) * 100}%`,
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
            {d.movementTrend.length === 0 || d.movementTrend.every((t) => t.inbound === 0 && t.outbound === 0) ? (
              <p className="text-sm text-gray-400 dark:text-gray-300 py-8 text-center">No movements in the last 14 days</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {d.movementTrend.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                    <div
                      className="w-full rounded-t bg-green-500 transition-all duration-500"
                      style={{ height: `${(day.inbound / d.maxTrend) * 100}%`, minHeight: day.inbound > 0 ? "2px" : "0" }}
                      title={`${day.label}: ${day.inbound} inbound`}
                    />
                    <div
                      className="w-full rounded-t bg-orange-400 transition-all duration-500"
                      style={{ height: `${(day.outbound / d.maxTrend) * 100}%`, minHeight: day.outbound > 0 ? "2px" : "0" }}
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
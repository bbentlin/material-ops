"use client";

import { useEffect, useState } from "react";

type Department = { id: string; name: string; color: string };

type Props = {
  search: string;
  setSearchAction: (v: string) => void;
  dateFrom: string;
  setDateFromAction: (v: string) => void;
  dateTo: string;
  setDateToAction: (v: string) => void;
  hasDateFilter: boolean;
  departmentFilter: string;
  setDepartmentFilterAction: (v: string) => void;
  departments: Department[];
  userName: string | null;
  userRole: string | null;
  roleBadge: Record<string, string>;
  canManageUsers: boolean;
  setShowScannerAction: (v: boolean) => void;
  onOpenOrdersAction: () => void;
  onOpenUsersAction: () => void;
  onLogoutAction: () => void;
  darkMode: boolean;
  onToggleDarkModeAction: () => void;
};

export default function DashboardHeader(props: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleMobileScan() {
    closeMobileMenu();
    props.setShowScannerAction(true);
  }

  function handleMobileOrders() {
    closeMobileMenu();
    props.onOpenOrdersAction();
  }

  function handleMobileUsers() {
    closeMobileMenu();
    props.onOpenUsersAction();
  }

  function handleMobileLogout() {
    closeMobileMenu();
    props.onLogoutAction();
  }

  function handleMobileToggleTheme() {
    closeMobileMenu();
    props.onToggleDarkModeAction();
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <h1 className="hidden text-xl font-bold text-gray-900 dark:text-gray-100 lg:block">
          📦 LogiCore Inventory Management System
        </h1>

        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 lg:hidden">📦 IMS</h1>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              aria-label="Search materials and part numbers"
              placeholder="Search materials, part numbers..."
              value={props.search}
              onChange={(e) => props.setSearchAction(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
            {props.search && (
              <button
                onClick={() => props.setSearchAction("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="date"
              aria-label="Start date"
              value={props.dateFrom}
              onChange={(e) => props.setDateFromAction(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-sm text-gray-400 dark:text-gray-100">→</span>
            <input
              type="date"
              aria-label="End date"
              value={props.dateTo}
              onChange={(e) => props.setDateToAction(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            {props.hasDateFilter && (
              <button
                onClick={() => {
                  props.setDateFromAction("");
                  props.setDateToAction("");
                }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-300"
                aria-label="Clear date range"
              >
                ✕
              </button>
            )}
          </div>

          <select
            aria-label="Filter by department"
            value={props.departmentFilter}
            onChange={(e) => props.setDepartmentFilterAction(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Departments</option>
            {props.departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 border-l border-gray-200 pl-3 dark:border-gray-600">
            {props.userName && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{props.userName}</span>}
            {props.userRole && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${props.roleBadge[props.userRole] || "bg-gray-200 text-gray-600"}`}>
                {props.userRole}
              </span>
            )}
          </div>

          <button
            onClick={() => props.setShowScannerAction(true)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            title="Scan barcode or QR code"
          >
            📷 Scan
          </button>

          <button
            onClick={props.onOpenOrdersAction}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            title="Purchase Orders"
          >
            📋 Orders
          </button>

          {props.canManageUsers && (
            <button
              onClick={props.onOpenUsersAction}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700 dark:text-gray-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-200"
            >
              👥 Users
            </button>
          )}

          <button
            onClick={props.onLogoutAction}
            className="rounded-md px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          >
            Sign Out
          </button>

          <button
            onClick={props.onToggleDarkModeAction}
            className="rounded-md px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            title={props.darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {props.darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="dashboard-mobile-menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <button
            className="fixed inset-0 z-40 bg-black/50"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            id="dashboard-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="fixed right-0 top-0 z-50 h-full w-[85vw] max-w-sm overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
              <button
                className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-300">Search</label>
                <input
                  type="text"
                  placeholder="Materials, part numbers..."
                  value={props.search}
                  onChange={(e) => props.setSearchAction(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-300">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={props.dateFrom}
                    onChange={(e) => props.setDateFromAction(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    aria-label="Start date"
                  />
                  <input
                    type="date"
                    value={props.dateTo}
                    onChange={(e) => props.setDateToAction(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    aria-label="End date"
                  />
                </div>
                {props.hasDateFilter && (
                  <button
                    onClick={() => {
                      props.setDateFromAction("");
                      props.setDateToAction("");
                    }}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Clear dates
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-300">Department</label>
                <select
                  value={props.departmentFilter}
                  onChange={(e) => props.setDepartmentFilterAction(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">All Departments</option>
                  {props.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Signed in as</div>
                <div className="flex items-center gap-2">
                  {props.userName && <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{props.userName}</span>}
                  {props.userRole && (
                    <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${props.roleBadge[props.userRole] || "bg-gray-200 text-gray-600"}`}>
                      {props.userRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                <button
                  onClick={handleMobileScan}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  📷 Scan
                </button>

                <button
                  onClick={handleMobileOrders}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  📋 Orders
                </button>

                {props.canManageUsers && (
                  <button
                    onClick={handleMobileUsers}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    👥 Users
                  </button>
                )}

                <button
                  onClick={handleMobileToggleTheme}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {props.darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
                </button>

                <button
                  onClick={handleMobileLogout}
                  className="w-full rounded-md border border-red-200 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
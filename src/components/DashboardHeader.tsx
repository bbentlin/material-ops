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

  const hasActiveFilters = Boolean(
    props.search || props.departmentFilter || props.hasDateFilter,
  );

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

  function clearAllFilters() {
    props.setSearchAction("");
    props.setDepartmentFilterAction("");
    props.setDateFromAction("");
    props.setDateToAction("");
  }

  return (
    <header className="border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-gray-700 dark:bg-gray-800/95">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Row 1: three-column balanced layout — brand | search | actions */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-base shadow-sm">
              📦
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                Inventory workspace
              </p>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 lg:text-lg">
                LogiCore Inventory
              </h1>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-2.5 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
              <svg
                className="h-4 w-4 shrink-0 text-gray-400"
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
                placeholder="Search materials..."
                value={props.search}
                onChange={(e) => props.setSearchAction(e.target.value)}
                className="w-full bg-transparent py-1 text-sm text-gray-900 outline-none placeholder-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder-gray-500"
              />
              {props.search && (
                <button
                  type="button"
                  onClick={() => props.setSearchAction("")}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="hidden items-center justify-end gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-2 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
              {props.userName && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {props.userName}
                </span>
              )}
              {props.userRole && (
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${props.roleBadge[props.userRole] || "bg-gray-200 text-gray-600"}`}
                >
                  {props.userRole}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={props.onOpenOrdersAction}
                aria-label="Purchase Orders"
                className="rounded-lg border border-gray-200 bg-white/80 px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:border-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                title="Purchase Orders"
              >
                📋
              </button>

              {props.canManageUsers && (
                <button
                  type="button"
                  onClick={props.onOpenUsersAction}
                  aria-label="Users"
                  className="rounded-lg border border-gray-200 bg-white/80 px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:border-purple-800 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                  title="Users"
                >
                  👥
                </button>
              )}

              <button
                type="button"
                onClick={props.onToggleDarkModeAction}
                aria-label="Toggle Ligh/Dark Mode"
                className="rounded-lg border border-gray-200 bg-white/80 p-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                title={props.darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {props.darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="col-start-3 inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="dashboard-mobile-menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>
        </div>

        {/* Row 2: centered filter pill — symmetric, no dangling actions */}
        <div className="mt-2.5 hidden justify-center border-t border-gray-200/80 pt-2.5 dark:border-gray-700 lg:flex">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              Department
              <select
                value={props.departmentFilter}
                onChange={(e) => props.setDepartmentFilterAction(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="">All Departments</option>
                {props.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>

            <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              From
              <input
                type="date"
                value={props.dateFrom}
                onChange={(e) => props.setDateFromAction(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              To
              <input
                type="date"
                value={props.dateTo}
                onChange={(e) => props.setDateToAction(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </label>

            <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

            <button
              type="button"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:text-gray-600"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside
            id="dashboard-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="fixed right-0 top-0 z-50 h-full w-[86vw] max-w-sm overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Menu
              </h2>
              <button
                type="button"
                className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Materials..."
                  value={props.search}
                  onChange={(e) => props.setSearchAction(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Department
                </label>
                <select
                  value={props.departmentFilter}
                  onChange={(e) => props.setDepartmentFilterAction(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">All Departments</option>
                  {props.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    From
                  </label>
                  <input
                    type="date"
                    value={props.dateFrom}
                    onChange={(e) => props.setDateFromAction(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    To
                  </label>
                  <input
                    type="date"
                    value={props.dateTo}
                    onChange={(e) => props.setDateToAction(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="w-full rounded-xl border border-blue-200 px-3 py-2 text-left text-sm font-medium text-blue-700 transition hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                >
                  Clear filters
                </button>
              )}

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleMobileScan}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  📷 Scan
                </button>

                <button
                  type="button"
                  onClick={handleMobileOrders}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  🧾 Orders
                </button>

                {props.canManageUsers && (
                  <button
                    type="button"
                    onClick={handleMobileUsers}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    👥 Users
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleMobileToggleTheme}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {props.darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
                </button>

                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="rounded-xl border border-red-200 px-3 py-2 text-left text-sm text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
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
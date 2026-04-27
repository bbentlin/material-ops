"use client";

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
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 px-4">
          📦 LogiCore Inventory Management System
        </h1>

        <div className="flex items-center gap-4">
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
              value={props.search}
              onChange={(e) => props.setSearchAction(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {props.search && (
              <button
                onClick={() => props.setSearchAction("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={props.dateFrom}
              onChange={(e) => props.setDateFromAction(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="From date"
            />
            <span className="text-gray-400 dark:text-gray-100 text-sm">→</span>
            <input
              type="date"
              value={props.dateTo}
              onChange={(e) => props.setDateToAction(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="To date"
            />
            {props.hasDateFilter && (
              <button
                onClick={() => {
                  props.setDateFromAction("");
                  props.setDateToAction("");
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
                title="Clear dates"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={props.departmentFilter}
            onChange={(e) => props.setDepartmentFilterAction(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {props.departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-300 pl-4">
            {props.userName && (
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{props.userName}</span>
            )}
            {props.userRole && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  props.roleBadge[props.userRole] || "bg-gray-200 text-gray-600"
                }`}
              >
                {props.userRole}
              </span>
            )}
          </div>

          <button
            onClick={() => props.setShowScannerAction(true)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
            title="Scan barcode or QR code"
          >
            📷 Scan
          </button>

          <button
            onClick={props.onOpenOrdersAction}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
            title="Purchase Orders"
          >
            📋 Orders
          </button>

          {props.canManageUsers && (
            <button
              onClick={props.onOpenUsersAction}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200/95 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 font-medium"
            >
              👥 Users
            </button>
          )}

          <button
            onClick={props.onLogoutAction}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Sign Out
          </button>

          <button
            onClick={props.onToggleDarkModeAction}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title={props.darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {props.darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
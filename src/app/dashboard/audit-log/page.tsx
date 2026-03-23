"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

const actionStyle: Record<string, { icon: string; label: string; bg: string }> = {
  LOGIN: { icon: "🔑", label: "Login", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  LOGOUT: { icon: "🚪", label: "Logout", bg: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  CREATE_MATERIAL: { icon: "📦", label: "Create Material", bg: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  UPDATE_MATERIAL: { icon: "✏️", label: "Update Material", bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  DELETE_MATERIAL: { icon: "🗑️", label: "Delete Material", bg: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  IMPORT_MATERIALS: { icon: "📥", label: "Import Materials", bg: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  INBOUND: { icon: "📈", label: "Inbound", bg: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  OUTBOUND: { icon: "📉", label: "Outbound", bg: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  TRANSFER: { icon: "🔄", label: "Transfer", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  CREATE_USER: { icon: "👤➕", label: "Create User", bg: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  UPDATE_USER: { icon: "👤✏️", label: "Update User", bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  DELETE_USER: { icon: "👤❌", label: "Delete User", bg: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

const entities = ["AUTH", "MATERIAL", "MOVEMENT", "USER"];

export default function AuditLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const limit = 25;

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  useEffect(() => {
    setPage(1);
  }, [search, entityFilter]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (entityFilter) params.set("entity", entityFilter);
    if (search) params.set("search", search);

    fetch(`/api/audit-logs?${params}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, entityFilter, router]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function parseDetails(entry: AuditEntry): string {
    if (!entry.details) return "-";
    try {
      const d = JSON.parse(entry.details);
      const parts: string[] = [];
      if (d.name) parts.push(d.name);
      if (d.partNumber) parts.push(`#${d.partNumber}`);
      if (d.email && entry.entity === "AUTH") parts.push(d.email);
      if (d.materialName) parts.push(d.materialName);
      if (d.quantity !== undefined) parts.push(`qty: ${d.quantity}`);
      if (d.from && d.to) parts.push(`${d.from} → ${d.to}`);
      if (d.created !== undefined) parts.push(`${d.created} created`);
      if (d.skipped !== undefined) parts.push(`${d.skipped} skipped`);
      if (d.changes && d.changes.length > 0) parts.push(d.changes.join(", "));
      if (d.role && entry.action === "CREATE_USER") parts.push(`role: ${d.role}`);
      return parts.join(" . ") || "-";
    } catch {
      return entry.details || "-";
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">📋 Audit Log</h1>
          </div>
          <div className="flex items-center gap-3">
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
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {entities.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <button
              onClick={toggleDarkMode}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {total} total log{total !== 1 ? "s" : ""}
          {entityFilter && ` in ${entityFilter}`}
          {search && ` matching "${search}"`}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-semibold tex-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      No audit log entries found
                    </td>
                  </tr>
                ) : (
                  logs.map((entry) => {
                    const style = actionStyle[entry.action] || {
                      icon: "📋",
                      label: entry.action,
                      bg: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                    };
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg}`}
                          >
                            <span>{style.icon}</span>
                            {style.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {entry.entity}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
                          {parseDetails(entry)}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {entry.user?.name || <span className="italic text-gray-400">deleted user</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Showing {(page -1) * limit + 1}-{Math.min(page * limit, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
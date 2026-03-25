"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AddMaterialModal from "@/components/AddMaterialModal";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";
import TransferModal from "@/components/TransferModal";
import ScannerModal from "@/components/ScannerModal";
import Toast, { ToastMessage } from "@/components/Toast";

type Material = {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  quantity: number;
  minQuantity?: number;
  unit?: string;
  location?: string;
  createdAt?: string;
  department?: { id: string; name: string; color: string } | null;
};

type Movement = {
  id: string;
  name: string;
  quantity: number;
  note?: string;
  type: string;
  createdAt: string;
  material: { name: string; partNumber: string };
  user: { name: string; email: string };
};

type SortKey = "name" | "partNumber" | "quantity" | "unit" | "location" | "department";
type SortDir = "asc" | "desc";

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

type StatsData = {
  totalMaterials: number;
  totalStock: number;
  lowStockCount: number;
  stockByDepartment: { name: string; color: string; total: number }[];
};

type TrendDay = {
  label: string;
  inbound: number;
  outbound: number;
};

type LowStockAlert = {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location?: string;
  department?: { id: string; name: string; color: string } | null;
  deficit: number;
  severity: "CRITICAL" | "LOW";
  percentOfThreshold: number;
};

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [totalMovements, setTotalMovements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState<string | null>(null);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string; color: string }[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [materialPage, setMaterialPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [movementTrend, setMovementTrend] = useState<TrendDay[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Initialize dark mode from localStorage / system preference
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

  function addToast(text: string, type: ToastMessage["type"] = "success") {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), text, type }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const router = useRouter();

  const materialsPerPage = 15;
  const movementsPerPage = 10;

  // Permission helpers
  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";
  const canDelete = userRole === "ADMIN";
  const canManageUsers = userRole === "ADMIN";

  // Debounce search — wait 300ms after typing stops
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setMaterialPage(1);
      setMovementPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset to page 1 when filters change (non-search)
  useEffect(() => {
    setMaterialPage(1);
    setMovementPage(1);
  }, [dateFrom, dateTo, departmentFilter, lowStockOnly]);

  // Fetch materials (server-side paginated)
  const fetchMaterials = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(materialPage));
    params.set("limit", String(materialsPerPage));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sortKey) {
      params.set("sortKey", sortKey);
      params.set("sortDir", sortDir);
    }
    if (departmentFilter) params.set("departmentId", departmentFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (lowStockOnly) params.set("lowStock", "true");

    fetch(`/api/materials?${params}`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to fetch materials");
        return res.json();
      })
      .then((data) => {
        setMaterials(data.materials || []);
        setTotalMaterials(data.total || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [materialPage, debouncedSearch, sortKey, sortDir, departmentFilter, dateFrom, dateTo, lowStockOnly, router]);

  // Fetch movements (server-side paginated)
  const fetchMovements = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(movementPage));
    params.set("limit", String(movementsPerPage));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/movements?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movements");
        return res.json();
      })
      .then((data) => {
        setMovements(data.movements || []);
        setTotalMovements(data.total || 0);
      })
      .catch(() => {
        setMovements([]);
        setTotalMovements(0);
      });
  }, [movementPage, debouncedSearch, dateFrom, dateTo]);

  function fetchCurrentUser() {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUserRole(data.role);
          setUserName(data.name);
        }
      })
      .catch(() => {});
  }

  function fetchDepartments() {
    fetch("/api/departments").then(r => r.ok ? r.json() : []).then(setDepartments).catch(() => {});
  }

  function fetchAuditLogs() {
    fetch("/api/audit-logs?limit=10")
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((data) => setAuditLogs(data.logs || []))
      .catch(() => {});
  }

  function fetchStats() {
    fetch("/api/materials/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setStats(data); })
      .catch(() => {});
  }

  function fetchMovementTrend() {
    fetch("/api/movements/trends")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMovementTrend)
      .catch(() => {});
  }

  function fetchLowStockAlerts() {
    fetch("/api/materials/alerts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLowStockAlerts)
      .catch(() => {});
  }

  // Re-fetch materials when filters/sort/page change
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Re-fetch movements when filters/page change
  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Initial load — static data
  useEffect(() => {
    fetchCurrentUser();
    fetchDepartments();
    fetchAuditLogs();
    fetchStats();
    fetchMovementTrend();
    fetchLowStockAlerts();
  }, []);

  // Refresh helper — called after mutations
  function refreshAll() {
    fetchMaterials();
    fetchMovements();
    fetchStats();
    fetchMovementTrend();
    fetchAuditLogs();
    fetchLowStockAlerts();
  }

  function handleScanResult(partNumber: string) {
    setShowScanner(false);
    fetch(`/api/materials/lookup?partNumber=${encodeURIComponent(partNumber)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not_found");
        return r.json();
      })
      .then((mat) => {
        router.push(`/dashboard/materials/${mat.id}`);
      })
      .catch(() => {
        addToast(`No material found for "${partNumber}"`, "error");
      });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setMaterialPage(1);
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  const hasDateFilter = dateFrom || dateTo;
  const hasAnyFilter = debouncedSearch || hasDateFilter || departmentFilter || lowStockOnly;

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setDateFrom("");
    setDateTo("");
    setDepartmentFilter("");
    setLowStockOnly(false);
  }

  // Chart data from stats
  const stockByDepartment = stats?.stockByDepartment || [];
  const maxDeptStock = Math.max(...stockByDepartment.map((d) => d.total), 1);

  // Movement trend chart
  const maxTrend = Math.max(...movementTrend.map((d) => Math.max(d.inbound, d.outbound)), 1);

  // Pagination calculations
  const totalMaterialPages = Math.max(1, Math.ceil(totalMaterials / materialsPerPage));
  const totalMovementPages = Math.max(1, Math.ceil(totalMovements / movementsPerPage));

  // Low stock alert counts
  const criticalCount = lowStockAlerts.filter((a) => a.severity === "CRITICAL").length;
  const lowCount = lowStockAlerts.filter((a) => a.severity === "LOW").length;

  function formatAuditAction(entry: AuditEntry): { icon: string; label: string; color: string } {
    const map: Record<string, { icon: string; label: string; color: string }> = {
      LOGIN: { icon: "🗝️", label: "Signed in", color: "text-blue-600 dark:text-blue-400" },
      LOGOOUT: { icon: "🚪", label: "Signed out", color: "text-gray-500 dark:text-gray-400" },
      CREATE_MATERIAL: { icon: "📦", label: "Created material", color: "text-green-600 dark:text-green-400" },
      UPDATE_MATERIAL: { icon: "🖋️", label: "Updated material", color: "text-yellow-600 dark:text-yellow-400" },
      DELETE_MATERIAL: { icon: "🗑️", label: "Deleted material", color: "text-red-600 dark:text-red-400" },
      IMPORT_MATERIALS: { icon: "📥", label: "Imported materials", color: "text-purple-600 dark:text-purple-400" },
      INBOUND: { icon: "📈", label: "Inbound", color: "text-green-600 dark:text-green-400" },
      OUTBOUND: { icon: "📉", label: "Outbound", color: "text-orange-600 dark:text-orange-400" },
      TRANSFER: { icon: "🔀", label: "Transfer", color: "text-blue-600 dark:text-blue-400" },
      CREATE_USER: { icon: "👤➕", label: "Created user", color: "text-green-600 dark:text-green-400" },
      UPDATE_USER: { icon: "👤✏️", label: "Updated user", color: "text-yellow-600 dark:text-yellow-400" },
      DELETE_USER: { icon: "👤❌", label: "Deleted user", color: "text-red-600 dark:text-red-400" },
    };
    return map[entry.action] || { icon: "📋", label: entry.action, color: "text-gray-600" };
  }

  function getAuditDetail(entry: AuditEntry): string {
    if (!entry.details) return "";
    try {
      const d = JSON.parse(entry.details);
      if (entry.action === "LOGIN" || entry.action === "LOGOUT") return "";
      if (entry.action === "IMPORT_MATERIALS") return `${d.created} created, ${d.skipped} skipped`;
      if (entry.action === "TRANSFER") return `${d.from} → ${d.to} (${d.quantity})`;
      if (d.materialName) return `${d.materialName} × ${d.quantity}`;
      if (d.name) return d.name;
      return "";
    } catch {
      return "";
    }
  }

  function exportCSV() {
    const params = new URLSearchParams();
    params.set("all", "true");
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sortKey) {
      params.set("sortKey", sortKey);
      params.set("sortDir", sortDir);
    }
    if (departmentFilter) params.set("departmentId", departmentFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/materials?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.json();
      })
      .then((allMaterials: Material[]) => {
        const headers = ["Name", "Part Number", "Description", "Quantity", "Min Quantity", "Unit", "Location", "Department"];
        const rows = allMaterials.map((m) => [
          m.name,
          m.partNumber,
          m.description ?? "",
          m.quantity.toString(),
          (m.minQuantity ?? 10).toString(),
          m.unit ?? "",
          m.location ?? "",
          m.department?.name ?? "",
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `materials-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => addToast("Export failed", "error"));
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        alert("CSV file is empty or has no data rows.");
        return;
      }

      const headerLine = lines[0];
      const headers = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

      const nameIdx = headers.findIndex((h) => h === "name");
      const pnIdx = headers.findIndex((h) => h.includes("part"));
      const descIdx = headers.findIndex((h) => h.includes("desc"));
      const qtyIdx = headers.findIndex((h) => h === "quantity");
      const minIdx = headers.findIndex((h) => h.includes("min"));
      const unitIdx = headers.findIndex((h) => h === "unit");
      const locIdx = headers.findIndex((h) => h.includes("location"));
      const deptIdx = headers.findIndex((h) => h.includes("department"));

      if (nameIdx === -1 || pnIdx === -1) {
        alert('CSV must have "Name" and "Part Number" columns.');
        return;
      }

      const importMaterials = lines.slice(1).map((line) => {
        const cols = line.match(/(".*?"|[^",]+|(?<=,)(?=,))/g)?.map((c) => c.trim().replace(/^"|"$/g, "")) ?? [];
        return {
          name: cols[nameIdx] ?? "",
          partNumber: cols[pnIdx] ?? "",
          description: descIdx >= 0 ? cols[descIdx] ?? "" : "",
          quantity: qtyIdx >= 0 ? cols[qtyIdx] ?? "0" : "0",
          minQuantity: minIdx >= 0 ? cols[minIdx] ?? "10" : "10",
          unit: unitIdx >= 0 ? cols[unitIdx] ?? "pieces" : "pieces",
          location: locIdx >= 0 ? cols[locIdx] ?? "" : "",
          department: deptIdx >= 0 ? cols[deptIdx] ?? "" : "",
        };
      });

      if (!confirm(`Import ${importMaterials.length} material(s) from CSV?`)) return;

      try {
        const res = await fetch("/api/materials/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materials: importMaterials }),
        });

        if (!res.ok) {
          const data = await res.json();
          addToast(data.error || "Import failed", "error");
          return;
        }

        const data = await res.json();
        addToast(`Import complete: ${data.created} created, ${data.skipped} skipped.`);
        refreshAll();
      } catch {
        addToast("Import failed. Please try again.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const roleBadge: Record<string, string> = {
    ADMIN: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    OPERATOR: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    VIEWER: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  };

  if (loading) {
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
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
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="From date"
              />
              <span className="text-gray-400 dark:text-gray-100 text-sm">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="To date"
              />
              {hasDateFilter && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  title="Clear dates"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {/* User info + role badge */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-300 pl-4">
              {userName && (
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{userName}</span>
              )}
              {userRole && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    roleBadge[userRole] || "bg-gray-200 text-gray-600"
                  }`}
                >
                  {userRole}
                </span>
              )}
            </div>

            {/* Scanner */}
            <button
              onClick={() => setShowScanner(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
              title="Scan barcode or QR code"
            >
              📷 Scan
            </button>

            {/* Admin link */}
            {canManageUsers && (
              <button
                onClick={() => router.push("/admin")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200/95 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 font-medium"
              >
                👥 Users
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Sign Out
            </button>
            <button
              onClick={toggleDarkMode}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Read-only banner for viewers */}
        {userRole === "VIEWER" && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <span className="text-lg">👁️</span>
            <span>
              You have <strong>view-only</strong> access. Contact an administrator to
              request edit permissions.
            </span>
          </div>
        )}

        {/* Search results indicator */}
        {hasAnyFilter && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>
              Showing {totalMaterials} material
              {totalMaterials !== 1 ? "s" : ""} and{" "}
              {totalMovements} movement
              {totalMovements !== 1 ? "s" : ""}
              {debouncedSearch && (
                <>
                  {" "}
                  matching &ldquo;
                  <span className="font-medium text-gray-700 dark:text-gray-200">{debouncedSearch}</span>
                  &rdquo;
                </>
              )}
              {hasDateFilter && (
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  {dateFrom && dateTo
                    ? `from ${dateFrom} to ${dateTo}`
                    : dateFrom
                    ? `from ${dateFrom}`
                    : `up to ${dateTo}`}
                </span>
              )}
              {lowStockOnly && (
                <span className="text-orange-600 dark:text-orange-400 font-medium"> — low stock only</span>
              )}
            </span>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Materials
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalMaterials ?? 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Stock
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalStock ?? 0}
            </div>
          </div>
          {/* Low Stock card — clickable to toggle filter */}
          <button
            onClick={() => {
              setLowStockOnly((prev) => !prev);
              setMaterialPage(1);
            }}
            className={`text-left bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 transition-all ${
              lowStockOnly
                ? "border-orange-400 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900"
                : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Low Stock
              </span>
              {(stats?.lowStockCount ?? 0) > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-600">
                {stats?.lowStockCount ?? 0}
              </span>
              {lowStockOnly && (
                <span className="text-xs text-orange-500 font-medium">Filter active</span>
              )}
            </div>
            {(stats?.lowStockCount ?? 0) > 0 && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {criticalCount > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-medium">{criticalCount} critical</span>
                )}
                {criticalCount > 0 && lowCount > 0 && " · "}
                {lowCount > 0 && (
                  <span className="text-orange-500 dark:text-orange-400">{lowCount} low</span>
                )}
                {" · Click to "}
                {lowStockOnly ? "show all" : "filter"}
              </div>
            )}
          </button>
        </div>

        {/* Low Stock Alerts Panel */}
        {lowStockAlerts.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 overflow-hidden">
            <button
              onClick={() => setShowAlerts((prev) => !prev)}
              className="w-full p-4 flex items-center justify-between hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Low Stock Alerts
                </h3>
                <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                  {lowStockAlerts.length} item{lowStockAlerts.length !== 1 ? "s" : ""}
                </span>
                {criticalCount > 0 && (
                  <span className="text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                    {criticalCount} critical
                  </span>
                )}
              </div>
              <span className="text-gray-400 text-sm">{showAlerts ? "▲ Hide" : "▼ Show"}</span>
            </button>
            {showAlerts && (
              <div className="border-t border-orange-100 dark:border-orange-900/30">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {lowStockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`px-5 py-3 flex items-center gap-4 ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-50/50 dark:bg-red-900/10"
                          : ""
                      }`}
                    >
                      {/* Severity badge */}
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                        }`}
                      >
                        {alert.severity === "CRITICAL" ? "CRITICAL" : "LOW"}
                      </span>
                      {/* Material info */}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => router.push(`/dashboard/materials/${alert.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline truncate block"
                        >
                          {alert.name}
                        </button>
                        <span className="text-xs text-gray-400 font-mono">{alert.partNumber}</span>
                      </div>
                      {/* Stock level bar */}
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
                      {/* Deficit */}
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 w-20 text-right">
                        Need {alert.deficit} more
                      </span>
                      {/* Department */}
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
                      {/* Quick restock button */}
                      {canEdit && (
                        <button
                          onClick={() => setShowMovement(alert.id)}
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
            {stockByDepartment.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No stock data</p>
            ) : (
              <div className="space-y-3">
                {stockByDepartment.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-200 w-24 truncate text-right" title={dept.name}>
                      {dept.name}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(dept.total / maxDeptStock) * 100}%`,
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
            {movementTrend.length === 0 || movementTrend.every((d) => d.inbound === 0 && d.outbound === 0) ? (
              <p className="text-sm text-gray-400 dark:text-gray-300 py-8 text-center">No movements in the last 14 days</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {movementTrend.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                    <div
                      className="w-full rounded-t bg-green-500 transition-all duration-500"
                      style={{ height: `${(day.inbound / maxTrend) * 100}%`, minHeight: day.inbound > 0 ? "2px" : "0" }}
                      title={`${day.label}: ${day.inbound} inbound`}
                    />
                    <div
                      className="w-full rounded-t bg-orange-400 transition-all duration-500"
                      style={{ height: `${(day.outbound / maxTrend) * 100}%`, minHeight: day.outbound > 0 ? "2px" : "0" }}
                      title={`${day.label}: ${day.outbound} outbound`}
                    />
                    <span className="text-[9px] text-gray-400 mt-1 leading-none whitespace-nowrap overflow-hidden">
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
              {lowStockOnly && (
                <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⚠️ Low stock only
                  <button
                    onClick={() => setLowStockOnly(false)}
                    className="hover:text-orange-900 dark:hover:text-orange-100 ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="text-sm font-medium text-gray-600 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                ↓ Export CSV
              </button>
              {canEdit && (
                <>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    ↑ Import CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setShowAddMaterial(true)}
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
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => toggleSort("name")}>
                    Name{sortIndicator("name")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => toggleSort("partNumber")}>
                    Part Number{sortIndicator("partNumber")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => toggleSort("quantity")}>
                    Quantity{sortIndicator("quantity")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => toggleSort("unit")}>
                    Unit{sortIndicator("unit")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => toggleSort("location")}>
                    Location{sortIndicator("location")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none" onClick={() => toggleSort("department")}>
                    Department{sortIndicator("department")}
                  </th>
                  {canEdit && <th className="px-5 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <button
                        onClick={() => router.push(`/dashboard/materials/${mat.id}`)}
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
                    {canEdit && (
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditMaterial(mat)}
                            className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setShowMovement(mat.id)}
                            className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
                          >
                            + Inbound
                          </button>
                          <button
                            onClick={() => setShowMovement(`out-${mat.id}`)}
                            className="text-sm font-medium bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-400 transition-colors"
                          >
                            − Outbound
                          </button>
                          <button
                            onClick={() => setShowTransfer(mat.id)}
                            className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors"
                          >
                            🔄 Transfer
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td
                      colSpan={canEdit ? 7 : 6}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      {hasAnyFilter
                        ? "No materials matching your filters"
                        : 'No materials yet. Click "+ Add Material" to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalMaterials > materialsPerPage && (
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Showing {(materialPage - 1) * materialsPerPage + 1}–
                {Math.min(materialPage * materialsPerPage, totalMaterials)} of{" "}
                {totalMaterials}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMaterialPage((p) => Math.max(1, p - 1))}
                  disabled={materialPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {materialPage} of {totalMaterialPages}
                </span>
                <button
                  onClick={() => setMaterialPage((p) => Math.min(totalMaterialPages, p + 1))}
                  disabled={materialPage === totalMaterialPages}
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
                {movements.map((mov) => (
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
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      {hasAnyFilter
                        ? "No movements matching your filters"
                        : "No movements yet. Record inbound or outbound stock above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalMovements > movementsPerPage && (
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Showing {(movementPage - 1) * movementsPerPage + 1}–
                {Math.min(movementPage * movementsPerPage, totalMovements)} of{" "}
                {totalMovements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                  disabled={movementPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {movementPage} of {totalMovementPages}
                </span>
                <button
                  onClick={() => setMovementPage((p) => Math.min(totalMovementPages, p + 1))}
                  disabled={movementPage === totalMovementPages}
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
              onClick={() => router.push("/dashboard/audit-log")}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {auditLogs.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400">No activity yet</div>
            ) : (
              auditLogs.map((entry) => {
                const { icon, label, color } = formatAuditAction(entry);
                const detail = getAuditDetail(entry);
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
      {showAddMaterial && canEdit && (
        <AddMaterialModal
          onCloseAction={() => setShowAddMaterial(false)}
          onSuccessAction={() => {
            setShowAddMaterial(false);
            refreshAll();
            addToast("Material added successfully");
          }}
        />
      )}

      {/* Edit Material Modal */}
      {editMaterial && canEdit && (
        <EditMaterialModal
          material={editMaterial}
          canDelete={canDelete}
          onCloseAction={() => setEditMaterial(null)}
          onSuccessAction={() => {
            setEditMaterial(null);
            refreshAll();
            addToast("Material updated successfully");
          }}
        />
      )}

      {/* Movement Modal */}
      {showMovement && canEdit && (
        <MovementModal
          materialId={showMovement.replace("out-", "")}
          type={showMovement.startsWith("out-") ? "OUTBOUND" : "INBOUND"}
          onCloseAction={() => setShowMovement(null)}
          onSuccessAction={() => {
            setShowMovement(null);
            refreshAll();
            addToast(
              showMovement?.startsWith("out-")
                ? "Outbound recorded"
                : "Inbound recorded"
            );
          }}
        />
      )}

      {/* Transfer Modal */}
      {showTransfer && canEdit && (
        <TransferModal
          sourceMaterialId={showTransfer}
          onCloseAction={() => setShowTransfer(null)}
          onSuccessAction={() => {
            setShowTransfer(null);
            refreshAll();
            addToast("Transfer completed");
          }}
        />
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal
          onCloseAction={() => setShowScanner(false)}
          onResultAction={handleScanResult}
        />
      )}

      <Toast messages={toasts} onDismissAction={dismissToast} />
    </div>
  );
}
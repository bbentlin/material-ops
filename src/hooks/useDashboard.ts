"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ToastMessage } from "@/components/Toast";
import type {
  Material,
  Movement,
  SortKey,
  SortDir,
  AuditEntry,
  StatsData,
  TrendDay,
  LowStockAlert,
  WidgetData,
} from "@/types/dashboard";

export function useDashboard() {
  const router = useRouter();

  // --- State ---
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
  const [widgets, setWidgets] = useState<WidgetData | null>(null);

  // --- Constants ---
  const materialsPerPage = 15;
  const movementsPerPage = 10;

  // --- Permissions ---
  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";
  const canDelete = userRole === "ADMIN";
  const canManageUsers = userRole === "ADMIN";

  // --- Dark mode ---
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // --- Toasts ---
  function addToast(text: string, type: ToastMessage["type"] = "success") {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), text, type }]);
  }
  
  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // --- Debounce search ---
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setMaterialPage(1);
    setMovementPage(1);
  }, [dateFrom, dateTo, departmentFilter, lowStockOnly]);

  // --- Fetch functions ---
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

  function fetchWidgets() {
    fetch("/api/dashboard/widgets")
    .then((r) => (r.ok ? r.json() : null))
    .then(setWidgets)
    .catch(() => {});
  }

  // --- Effects ---
  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);
  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  useEffect(() => {
    fetchCurrentUser();
    fetchDepartments();
    fetchAuditLogs();
    fetchStats();
    fetchMovementTrend();
    fetchLowStockAlerts();
    fetchWidgets();
  }, []);

  function refreshAll() {
    fetchMaterials();
    fetchMovements();
    fetchStats();
    fetchMovementTrend();
    fetchAuditLogs();
    fetchLowStockAlerts();
    fetchWidgets();
  }

  // --- Handlers ---
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
    if (sortKey !== key) return "none" as const;
    return sortDir;
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  const hasDateFilter = Boolean(dateFrom || dateTo);
  const hasAnyFilter = Boolean(debouncedSearch || hasDateFilter || departmentFilter || lowStockOnly);

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setDateFrom("");
    setDateTo("");
    setDepartmentFilter("");
    setLowStockOnly(false);
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
        alert("CSV file is empty or has no data rows");
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

  function formatAuditAction(entry: AuditEntry): { icon: string; label: string; color: string } {
    const map: Record<string, { icon: string; label: string; color: string }> = {
      LOGIN: { icon: "🗝️", label: "Signed in", color: "text-blue-600 dark:text-blue-400" },
      LOGOUT: { icon: "🚪", label: "Signed out", color: "text-gray-500 dark:text-gray-400" },
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

  // --- Computed values ---
  const stockByDepartment = stats?.stockByDepartment || [];
  const maxDeptStock = Math.max(...stockByDepartment.map((d) => d.total), 1);
  const maxTrend = Math.max(...movementTrend.map((d) => Math.max(d.inbound, d.outbound)), 1);
  const totalMaterialPages = Math.max(1, Math.ceil(totalMaterials / materialsPerPage));
  const totalMovementPages = Math.max(1, Math.ceil(totalMovements / movementsPerPage));
  const criticalCount = lowStockAlerts.filter((a) => a.severity === "CRITICAL").length;
  const lowCount = lowStockAlerts.filter((a) => a.severity === "LOW").length;

  const roleBadge: Record<string, string> = {
    ADMIN: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    OPERATOR: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    VIEWER: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  };

  return {
    // State
    materials, totalMaterials, movements, totalMovements,
    loading, error,
    showAddMaterial, setShowAddMaterial,
    showMovement, setShowMovement,
    showTransfer, setShowTransfer,
    editMaterial, setEditMaterial,
    search, setSearch,
    dateFrom, setDateFrom, dateTo, setDateTo,
    userRole, userName,
    departments, departmentFilter, setDepartmentFilter,
    materialPage, setMaterialPage, movementPage, setMovementPage,
    sortKey, sortDir,
    toasts, darkMode,
    auditLogs, stats, movementTrend,
    lowStockAlerts, showAlerts, setShowAlerts,
    lowStockOnly, setLowStockOnly,
    showScanner, setShowScanner,
    widgets,

    // Constants
    materialsPerPage, movementsPerPage,

    // Permissions
    canEdit, canDelete, canManageUsers,

    // Computed
    hasDateFilter, hasAnyFilter,
    stockByDepartment, maxDeptStock, maxTrend,
    totalMaterialPages, totalMovementPages,
    criticalCount, lowCount,
    roleBadge,
    debouncedSearch,

    // Handlers
    toggleDarkMode, addToast, dismissToast,
    toggleSort, sortIndicator,
    handleLogout, handleScanResult,
    clearFilters, exportCSV, handleImportCSV,
    refreshAll, 
    formatAuditAction, getAuditDetail,
    router,
  };
}
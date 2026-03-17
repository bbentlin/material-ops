"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddMaterialModal from "@/components/AddMaterialModal";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";

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

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [search, setSearch] = useState("");
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
  const router = useRouter();

  const materialsPerPage = 15;
  const movementsPerPage = 10;

  // Permission helpers
  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";
  const canDelete = userRole === "ADMIN";
  const canManageUsers = userRole === "ADMIN";

  function fetchMaterials() {
    fetch("/api/materials")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to fetch materials");
        return res.json();
      })
      .then(setMaterials)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function fetchMovements() {
    fetch("/api/movements")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movements");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMovements(data);
        }
      })
      .catch(() => setMovements([]));
  }

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

  useEffect(() => {
    fetchMaterials();
    fetchMovements();
    fetchCurrentUser();
    fetchDepartments();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setMaterialPage(1);
    setMovementPage(1);
  }, [search, dateFrom, dateTo, departmentFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        // Third click: clear sort
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

  function isInDateRange(dateStr: string | undefined): boolean {
    if (!dateFrom && !dateTo) return true;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (date < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
    return true;
  }

  const hasDateFilter = dateFrom || dateTo;
  const hasAnyFilter = search || hasDateFilter || departmentFilter;

  const filteredMaterials = materials.filter((mat) => {
    const q = search.toLowerCase();
    const matchesText =
      mat.name.toLowerCase().includes(q) ||
      mat.partNumber.toLowerCase().includes(q) ||
      (mat.description ?? "").toLowerCase().includes(q) ||
      (mat.location ?? "").toLowerCase().includes(q) ||
      (mat.unit ?? "").toLowerCase().includes(q);
    const matchesDate = isInDateRange(mat.createdAt);
    const matchesCategory = !departmentFilter || mat.department?.id === departmentFilter;
    return matchesText && matchesDate && matchesCategory;
  });

  const sortedMaterials = sortKey
    ? [...filteredMaterials].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;
        if (sortKey === "quantity") {
          aVal = a.quantity;
          bVal = b.quantity;
        } else if (sortKey === "department") {
          aVal = a.department?.name?.toLowerCase() ?? "";
          bVal = b.department?.name?.toLowerCase() ?? "";
        } else {
          aVal = (a[sortKey] ?? "").toString().toLowerCase();
          bVal = (b[sortKey] ?? "").toString().toLowerCase();
        }
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : filteredMaterials;

  const filteredMovements = movements.filter((mov) => {
    const matchesText =
      !search ||
      (() => {
        const q = search.toLowerCase();
        return (
          mov.material.name.toLowerCase().includes(q) ||
          mov.material.partNumber.toLowerCase().includes(q) ||
          mov.type.toLowerCase().includes(q) ||
          (mov.note ?? "").toLowerCase().includes(q) ||
          mov.user.name.toLowerCase().includes(q)
        );
      })();
    const matchesDate = isInDateRange(mov.createdAt);
    return matchesText && matchesDate;
  });

  // Pagination calculations
  const totalMaterialPages = Math.max(1, Math.ceil(sortedMaterials.length / materialsPerPage));
  const paginatedMaterials = sortedMaterials.slice(
    (materialPage - 1) * materialsPerPage,
    materialPage * materialsPerPage
  );

  const totalMovementPages = Math.max(1, Math.ceil(filteredMovements.length / movementsPerPage));
  const paginatedMovements = filteredMovements.slice(
    (movementPage - 1) * movementsPerPage,
    movementPage * movementsPerPage
  );

  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setDepartmentFilter("");
  }

  const roleBadge: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    OPERATOR: "bg-blue-100 text-blue-700",
    VIEWER: "bg-gray-200 text-gray-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
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
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="border border-gray-300 rounded-lg text-sm text-gray-900 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="From date"
              />
              <span className="text-gray-400 text-sm">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg text-sm text-gray-900 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="border border-gray-300 rounded-lg text-sm text-gray-900 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {/* User info + role badge */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              {userName && (
                <span className="text-sm text-gray-700 font-medium">{userName}</span>
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
            {/* Admin link */}
            {canManageUsers && (
              <button
                onClick={() => router.push("/admin")}
                className="text-sm text-gray-600 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-50 font-medium"
              >
                👥 Users
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Read-only banner for viewers */}
        {userRole === "VIEWER" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <span className="text-lg">👁️</span>
            <span>
              You have <strong>view-only</strong> access. Contact an administrator to
              request edit permissions.
            </span>
          </div>
        )}

        {/* Search results indicator */}
        {hasAnyFilter && (
          <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
            <span>
              Showing {filteredMaterials.length} material
              {filteredMaterials.length !== 1 ? "s" : ""} and{" "}
              {filteredMovements.length} movement
              {filteredMovements.length !== 1 ? "s" : ""}
              {search && (
                <>
                  {" "}
                  matching &ldquo;
                  <span className="font-medium text-gray-700">{search}</span>
                  &rdquo;
                </>
              )}
              {hasDateFilter && (
                <span className="text-gray-500">
                  {" "}
                  {dateFrom && dateTo
                    ? `from ${dateFrom} to ${dateTo}`
                    : dateFrom
                    ? `from ${dateFrom}`
                    : `up to ${dateTo}`}
                </span>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Materials
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {materials.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Stock
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {materials.reduce((sum, m) => sum + m.quantity, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Low Stock 
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {materials.filter((m) => m.quantity <= (m.minQuantity ?? 10)).length}
            </div>
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
            {canEdit && (
              <button
                onClick={() => setShowAddMaterial(true)}
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Add Material
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort("name")}>
                    Name{sortIndicator("name")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort("partNumber")}>
                    Part Number{sortIndicator("partNumber")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort("quantity")}>
                    Quantity{sortIndicator("quantity")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort("unit")}>
                    Unit{sortIndicator("unit")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort("location")}>
                    Location{sortIndicator("location")}
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort("department")}>
                    Department{sortIndicator("department")}
                  </th>
                  {canEdit && <th className="px-5 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <button
                        onClick={() => router.push(`/dashboard/materials/${mat.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {mat.name}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-sm">{mat.partNumber}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${
                          mat.quantity <= (mat.minQuantity ?? 10)
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {mat.quantity}
                        {mat.quantity <= (mat.minQuantity ?? 10) && (
                          <span className="text-xs text-orange-500 ml-1">
                            (min: {mat.minQuantity ?? 10})
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{mat.unit}</td>
                    <td className="px-5 py-4 text-gray-500">{mat.location}</td>
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
                            className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setShowMovement(mat.id)}
                            className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            + Inbound
                          </button>
                          <button
                            onClick={() => setShowMovement(`out-${mat.id}`)}
                            className="text-sm font-medium bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            − Outbound
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
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
          {sortedMaterials.length > materialsPerPage && (
            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing {(materialPage - 1) * materialsPerPage + 1}– 
                {Math.min(materialPage * materialsPerPage, sortedMaterials.length)} of{" "}
                {sortedMaterials.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMaterialPage((p) => Math.max(1, p - 1))}
                  disabled={materialPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {materialPage} of {totalMaterialPages}
                </span>
                <button
                  onClick={() => setMaterialPage((p) => Math.min(totalMaterialPages, p + 1))}
                  disabled={materialPage === totalMaterialPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Material</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(mov.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">
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
                    <td className="px-5 py-4 font-medium text-gray-900">{mov.quantity}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{mov.note || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{mov.user.name}</td>
                  </tr>
                ))}
                {filteredMovements.length === 0 && (
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
          {filteredMovements.length > movementsPerPage && (
            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing {(movementPage - 1) * movementsPerPage + 1}–
                {Math.min(movementPage * movementsPerPage, filteredMovements.length)} of{" "}
                {filteredMovements.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                  disabled={movementPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {movementPage} of {totalMovementPages}
                </span>
                <button
                  onClick={() => setMovementPage((p) => Math.min(totalMovementPages, p + 1))}
                  disabled={movementPage === totalMovementPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Material Modal */}
      {showAddMaterial && canEdit && (
        <AddMaterialModal
          onCloseAction={() => setShowAddMaterial(false)}
          onSuccessAction={() => {
            setShowAddMaterial(false);
            fetchMaterials();
            fetchMovements();
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
            fetchMaterials();
            fetchMovements();
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
            fetchMaterials();
            fetchMovements();
          }}
        />
      )}
    </div>
  );
}
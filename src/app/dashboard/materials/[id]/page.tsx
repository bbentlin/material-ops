"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";

type Movement = {
  id: string;
  type: string;
  quantity: number;
  note?: string;
  createdAt: string;
  user: { name: string; email: string };
};

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
  updatedAt?: string;
  department?: { id: string; name: string; color: string } | null;
  movements: Movement[]; 
};

export default function MaterialDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMovement, setShowMovement] = useState<"INBOUND" | "OUTBOUND" | null>(null);
  const [editMaterial, setEditMaterial] = useState(false);
  const [movementPage, setMovementPage] = useState(1);

  const movementsPerPage = 15;
  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";
  const canDelete = userRole === "ADMIN";

  function fetchMaterial() {
    fetch(`/api/materials/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (res.status === 404) throw new Error("Material not found");
        if (!res.ok) throw new Error("Failed to fetch material");
        return res.json();
      })
      .then(setMaterial)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchMaterial();
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {if (data) setUserRole(data.role); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error || "Material not found"}</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isLowStock = material.quantity <= (material.minQuantity ?? 10);
  const movements = material.movements ?? [];
  const totalPages = Math.max(1, Math.ceil(movements.length / movementsPerPage));
  const paginatedMovements = movements.slice(
    (movementPage - 1) * movementsPerPage,
    movementPage * movementsPerPage
  );

  // Compute summary stats
  const totalInbound = movements.filter((m) => m.type === "INBOUND").reduce((s, m) => s + m.quantity, 0);
  const totalOutbound = movements.filter((m) => m.type === "OUTBOUND").reduce((s, m) => s + m.quantity, 0);

  return (
    <div className="min-h-screeen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium text-sm flex items-center gap-1"
          >
            ← Dashboard
          </button>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{material.name}</h1>
          {material.department && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: material.department.color }}
            >
              {material.department.name}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Material Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{material.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1">{material.partNumber}</p>
              {material.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{material.description}</p>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMaterial(true)}
                  className="text-sm font-medium bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setShowMovement("INBOUND")}
                  className="text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Inbound
                </button>
                <button
                  onClick={() => setShowMovement("OUTBOUND")}
                  className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  - Outbound
                </button>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quantity</div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${
                  isLowStock ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                }`}
              >
                {material.quantity}
              </span>
              {isLowStock && (
                <div className="text-xs text-orange-600 mt-1">
                  ⚠ Below minimum ({material.minQuantity ?? 10})
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Min Quantity</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{material.minQuantity ?? 10}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Unit</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{material.unit || "-"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{material.location || "-"}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-6 text-xs text-gray-400 dark:text-gray-500">
            {material.createdAt && (
              <span>Created: {new Date(material.createdAt).toLocaleString()}</span>
            )}
            {material.updatedAt && (
              <span>Updated: {new Date(material.updatedAt).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Movement Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Movements</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{movements.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Inbound</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{totalInbound}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Outbound</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{totalOutbound}</div>
          </div>
        </div>

        {/* Movement History Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-900 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Movement History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(mov.createdAt).toLocaleString()}
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
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">{mov.quantity}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{mov.note || "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{mov.user.name}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      No movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {movements.length > movementPage && (
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-500">
                Showing {(movementPage - 1) * movementPage + 1}-
                {Math.min(movementPage * movementsPerPage, movements.length)} of {movements.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                  disabled={movementPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  Page {movementPage} of {totalPages}
                </span>
                <button
                  onClick={() => setMovementPage((p) => Math.min(totalPages, p + 1))}
                  disabled={movementPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled::cursor-not-allowed
                  "
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Material Modal */}
      {editMaterial && (
        <EditMaterialModal
          material={material}
          canDelete={canDelete}
          onCloseAction={() => setEditMaterial(false)}
          onSuccessAction={() => {
            setEditMaterial(false);
            fetchMaterial();
          }}
        />
      )}

      {/* Movement Modal */}
      {showMovement && (
        <MovementModal
          materialId={material.id}
          type={showMovement}
          onCloseAction={() => setShowMovement(null)}
          onSuccessAction={() => {
            setShowMovement(null);
            fetchMaterial();
          }}
        />
      )}
    </div>
  );
}
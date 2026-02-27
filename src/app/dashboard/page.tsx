"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddMaterialModal from "@/components/AddMaterialModal";
import MovementModal from "@/components/MovementModal";

type Material = {
  id: string;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  unit?: string;
  location?: string;
};

type Movement = {
  id: string;
  name: string;
  quantity: number;
  note?: string;
  type: string;
  createdAt: string;
  material: { name: string; sku: string };
  user: { name: string; email: string };
};

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    fetchMaterials();
    fetchMovements();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

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
          <h1 className="text-xl font-bold text-gray-900">📦 MaterialOps</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Unique Items</div>
            <div className="text-3xl font-bold text-gray-900">{materials.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Stock</div>
            <div className="text-3xl font-bold text-gray-900">
              {materials.reduce((sum, m) => sum + m.quantity, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Low Stock (≤10)</div>
            <div className="text-3xl font-bold text-orange-600">
              {materials.filter((m) => m.quantity <= 10).length}
            </div>
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
            <button
              onClick={() => setShowAddMaterial(true)}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add Material
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Unit</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{mat.name}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-sm">{mat.sku}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${
                          mat.quantity <= 10
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {mat.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{mat.unit}</td>
                    <td className="px-5 py-4 text-gray-500">{mat.location}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
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
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      No materials yet. Click &quot;+ Add Material&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                {movements.slice(0, 10).map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(mov.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">{mov.material.name}</td>
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
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      No movements yet. Record inbound or outbound stock above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Material Modal */}
      {showAddMaterial && (
        <AddMaterialModal
          onCloseAction={() => setShowAddMaterial(false)}
          onSuccessAction={() => {
            setShowAddMaterial(false);
            fetchMaterials();
            fetchMovements();
          }}
        />
      )}

      {/* Movement Modal */}
      {showMovement && (
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
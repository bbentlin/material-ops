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
      <div>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div>
        <div>
          <div>{error || "Material not found"}</div>
          <button>
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
    <div>
      {/* Header */}
      <header>
        <div>
          <button>
            ← Dashboard
          </button>
          <div/>
          <h1>{material.name}</h1>
          {material.department && (
            <span>
              {material.department.name}
            </span>
          )}
        </div>
      </header>

      <main>
        {/* Material Info Card */}
        <div>
          <div>
            <div>
              <h2>{material.name}</h2>
              <p>{material.partNumber}</p>
              {material.description && (
                <p>{material.description}</p>
              )}
            </div>
            {canEdit && (
              <div>
                <button>
                  ✏️ Edit
                </button>
                <button>
                  + Inbound
                </button>
                <button>
                  - Outbound
                </button>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div>
            <div>
              <div>Quantity</div>
              <span>
                {material.quantity}
              </span>
              {isLowStock && (
                <div>
                  ⚠ Below minimum ({material.minQuantity ?? 10})
                </div>
              )}
            </div>
            <div>
              <div>Min Quantity</div>
              <div>{material.minQuantity ?? 10}</div>
            </div>
            <div>
              <div>Unit</div>
              <div>{material.unit || "-"}</div>
            </div>
            <div>
              <div>Location</div>
              <div>{material.location || "-"}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            {material.createdAt && (
              <span>Created: {new Date(material.createdAt).toLocaleString()}</span>
            )}
            {material.updatedAt && (
              <span>Updated: {new Date(material.updatedAt).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Movement Summary Cards */}
        
      </main>
    </div>
  )
}
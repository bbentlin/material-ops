"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { SkeletonBox, SkeletonText } from "@/components/Skeleton";
import { MaterialWithMovements } from "@/types/domain";
import MovementModal from "@/components/MovementModal";
import EditMaterialModal from "@/components/EditMaterialModal";
import Barcode128 from "@/components/Barcode128";

export default function MaterialDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<MaterialWithMovements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMovement, setShowMovement] = useState<"INBOUND" | "OUTBOUND" | null>(null);
  const [editMaterial, setEditMaterial] = useState(false);
  const [movementPage, setMovementPage] = useState(1);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const labelRef = useRef<HTMLDivElement>(null);

  const movementsPerPage = 15;
  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";
  const canDelete = userRole === "ADMIN";

  const fetchMaterial = useCallback(() => {
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
  }, [id, router]);

  useEffect(() => {
    if (!material) return;
    const qrData = material.partNumber;
    import("qrcode")
      .then((QRCode) => {
        QRCode.toDataURL(qrData, {
          width: 180,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        })
          .then(setQrDataUrl)
          .catch(() => {});
      })
      .catch(() => {});
  }, [material]);

  useEffect(() => {
    fetchMaterial();
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUserRole(data.role);
      })
      .catch(() => {});
  }, [fetchMaterial]);

  function printLabel() {
    if (!labelRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Label - ${material?.partNumber}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>${labelRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  if (loading) {
    return (
      <div>
        <header>
          <div>
            <SkeletonText />
            <div />
            <SkeletonBox />
          </div>
        </header>

        <main>
          <div>
            <div>
              <SkeletonBox />
              <SkeletonBox />
              <div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div>
                    <SkeletonText />
                    <SkeletonBox />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SkeletonText />
              <SkeletonBox />
              <SkeletonBox />
            </div>
          </div>

          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div>
                <SkeletonText />
                <SkeletonBox />
              </div>
            ))}
          </div>

          <div>
            <div>
              <SkeletonText />
            </div>
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBox />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div>
        <div>
          <div>{}</div>
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

  const totalInbound = movements  
    .filter((m) => m.type === "INBOUND")
    .reduce((s, m) => s + m.quantity, 0);
  const totalOutbound = movements
    .filter((m) => m.type === "OUTBOUND")
    .reduce((s, m) => s + m.quantity, 0);

  return (
    <div>
      <header>
        <div>
          <div>
            <button>
              ← Dashboard
            </button>
            <div />
            <div>
              <h1>
                {material.name}
              </h1>
              {material.department && (
                <span>
                  {material.department.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <div>
          <div>
            <div>
              <div>
                <h2>
                  {material.name}
                </h2>
                <p>
                  {material.partNumber}
                </p>
                {material.description && (
                  <p>
                    {material.description}
                  </p>
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

            <div>
              <div>
                <div>
                  Quantity
                </div>
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
                <div>
                  Min Quantity
                </div>
                <div>
                  {material.minQuantity ?? 10}
                </div>
              </div>
              <div>
                <div>
                  Unit
                </div>
                <div>
                  {material.unit || "-"}
                </div>
              </div>
              <div>
                <div>
                  Location
                </div>
                <div>
                  {material.location || "-"}
                </div>
              </div>
            </div>

            <div>
              {material.createdAt && <span>Created: {new Date(material.createdAt).toLocaleString()}</span>}
              {material.updatedAt && <span>Updated: {new Date(material.updatedAt).toLocaleString()}</span>}
            </div>
          </div>

          <div>
            <div>
              <h3>Label</h3>
              <button>
                🖨️ Print
              </button>
            </div>

            <div>
              {qrDataUrl ? (
                <Image />
              ) : (
                <div>
                  QR Code
                </div>
              )}

              <Barcode128 />

              <div>
                <div>
                  {material.name}
                </div>
                {material.location && (
                  <div>
                    📍 {material.location}
                  </div>
                )}
                {material.department && (
                  <div>
                    {material.department.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div>Total Movements</div>
            <div>{movements.length}</div>
          </div>
          <div>
            <div>Total Inbound</div>
            <div>{totalInbound}</div>
          </div>
          <div>
            <div>Total Outbound</div>
            <div>{totalOutbound}</div>
          </div>
        </div>

        <div>
          <div>
            <h2>Movement History</h2>
          </div>

          <div>
            {paginatedMovements.map((mov) => (
              <div>
                <div>
                  <span>
                    {mov.type}
                  </span>
                  <span>{mov.quantity}</span>
                </div>

                <div>
                  {new Date(mov.createdAt).toLocaleString()}
                </div>
                <div>By: {mov.user.name}</div>
                <div>
                  {mov.note || "-"}
                </div>
              </div>
            ))}

            {movements.length === 0 && (
              <div>No movements recorded yet.</div>
            )}
          </div>

          <div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Note</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovements.map((mov) => (
                  <tr>
                    <td>
                      {new Date(mov.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span>
                        {mov.type}
                      </span>
                    </td>
                    <td>{mov.quantity}</td>
                    <td>{mov.note || "-"}</td>
                    <td>{mov.user.name}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td>
                      No movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {movements.length > movementsPerPage && (
            <div>
              <div>
                <span>
                  Showing {(movementPage - 1) * movementsPerPage + 1}-
                  {Math.min(movementPage * movementsPerPage, movements.length)} of {movements.length}
                </span>
                <div>
                  <button>
                    ← Previous
                  </button>
                  <span>
                    Page {movementPage} of {totalPages}
                  </span>
                  <button>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
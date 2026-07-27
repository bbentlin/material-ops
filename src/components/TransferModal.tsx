"use client";

import { useState, useEffect, useTransition } from "react";
import { SkeletonText } from "@/components/Skeleton";
import { MaterialBase } from "@/types/domain";
import DraggableModal from "@/components/DraggableModal";

type TransferMaterial = Pick<MaterialBase, "id" | "name" | "partNumber" | "quantity" | "location">;

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

export default function TransferModal({
  sourceMaterialId,
  onCloseAction,
  onSuccessAction,
}: {
  sourceMaterialId: string;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [materials, setMaterials] = useState<TransferMaterial[]>([]);
  const [destinationId, setDestinationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/materials?all=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMaterials(Array.isArray(data) ? data : data.materials ?? []))
      .catch(() => {});
  }, []);

  const source = materials.find((m) => m.id === sourceMaterialId);
  const destinations = materials.filter((m) => m.id !== sourceMaterialId);

  function handleSubmit() {
    if (!destinationId) {
      setError("Please select a destination material");
      return;
    }
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: sourceMaterialId,
          destinationMaterialId: destinationId,
          type: "TRANSFER",
          quantity,
          note,
        }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to record transfer");
      }
    });
  }

  return (
    <DraggableModal onCloseAction={onCloseAction} labelledBy="transfer-title">
      <form action={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 id="transfer-title" className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
          🔄 Transfer Material
        </h2>

        {/* Source */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {source ? (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium">{source.name}</span>
                <span className="text-gray-400 dark:text-gray-300">{source.partNumber}</span>
                <span className="text-gray-500 dark:text-gray-300">Qty: {source.quantity}</span>
              </div>
            ) : (
              <SkeletonText className="h-4 w-40" />
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1">
          <label htmlFor="transfer-dest" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To <span className="text-red-500">*</span>
          </label>
          <select
            id="transfer-dest"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select destination material...</option>
            {destinations.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.partNumber}) - Qty: {m.quantity}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1">
          <label htmlFor="transfer-qty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="transfer-qty"
            type="number"
            min={1}
            max={source?.quantity ?? undefined}
            placeholder="Enter quantity"
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          {source && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Available: {source.quantity}
            </span>
          )}
        </div>

        {/* Note */}
        <div className="flex flex-col gap-1">
          <label htmlFor="transfer-note" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Note
          </label>
          <input
            id="transfer-note"
            placeholder="Optional note (e.g. relocating to Warehouse B)"
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCloseAction}
            className="flex-1 rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
"use client";

import { useState, useEffect, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass = 
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

type Material = {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  location?: string;
};

export default function TransferModal({
  sourceMaterialId,
  onCloseAction,
  onSuccessAction,
}: {
  sourceMaterialId: string;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [destinationId, setDestinationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMaterials)
      .catch(() => {});
  },  []);

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
        headers: { "ContentType": "application/json" },
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
    <DraggableModal className="w-96">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">🔄 Transfer Stock</h2>

        {/* Source */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="border border-gray-200 bg-gray-50 rounded-md p-2 text-sm text-gray-700">
            {source ? (
              <>
                <span className="font-medium">{source.name}</span>
                <span className="text-gray-400 ml-2">{source.partNumber}</span>
                <span className="text-gray-500 ml-2">Qty: {source.quantity}</span>
              </>
            ) : (
              <span className="text-gray-400">Loading...</span>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1">
          <label htmlFor="transfer-dest" className="text-sm font-medium text-gray-700">
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
          <label htmlFor="transfer-qty" className="text-sm font-medium text-gray-700">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="transfer=qty"
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
            <span className="text-xs text-gray-400">
              Available: {source.quantity}
            </span>
          )}
        </div>

        {/* Note */}
        <div className="flex flex-col gap-1">
          <label htmlFor="transfer-note" className="text-sm font-medium text-gray-700">
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

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={onCloseAction}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
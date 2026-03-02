"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

export default function MovementModal({
  materialId,
  type,
  onCloseAction,
  onSuccessAction,
}: {
  materialId: string;
  type: "INBOUND" | "OUTBOUND";
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantity, note, materialId }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create movement");
      }
    });
  }

  return (
    <DraggableModal className="w-80">
      <form
        action={handleSubmit}
        className="p-6 flex flex-col gap-3"
      >
        <h2 className="text-lg font-bold text-gray-900">
          {type === "INBOUND" ? "📦 Inbound" : "📤 Outbound"} Movement
        </h2>
        <input
          type="number"
          min={1}
          placeholder="Quantity"
          className={inputClass}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
        <input
          placeholder="Note (optional)"
          className={inputClass}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
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
            className={`flex-1 text-white py-2 rounded disabled:opacity-50 ${
              type === "INBOUND"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPending ? "Saving..." : "Confirm"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
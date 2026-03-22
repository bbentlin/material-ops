"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

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
        body: JSON.stringify({ materialId, type, quantity, note }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to record movement");
      }
    });
  }

  const isInbound = type === "INBOUND";

  return (
    <DraggableModal className="w-96">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          {isInbound ? "📥 Record Inbound" : "📤 Record Outbound"}
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="mov-quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="mov-quantity"
            type="number"
            min={1}
            placeholder="Enter quantity"
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="mov-note" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Note
          </label>
          <input
            id="mov-note"
            placeholder="Optional note (e.g. PO #1234)"
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
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`flex-1 text-white py-2 rounded disabled:opacity-50 ${
              isInbound
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPending
              ? "Recording..."
              : isInbound
              ? "Record Inbound"
              : "Record Outbound"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
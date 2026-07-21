"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

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
    <DraggableModal>
      <form action={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
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
            className={`flex-1 rounded py-2 text-white disabled:opacity-50 ${
              isInbound
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPending ? "Recording..." : isInbound ? "Record Inbound" : "Record Outbound"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
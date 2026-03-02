"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

export default function AddMaterialModal({
  onCloseAction,
  onSuccessAction,
}: {
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("pieces");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku, description, quantity, unit, location }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create material");
      }
    });
  }

  return (
    <DraggableModal className="w-96">
      <form
        action={handleSubmit}
        className="p-6 flex flex-col gap-3"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-2">Add New Material</h2>
        <input
          placeholder="Name *"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="SKU *"
          className={inputClass}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Qty"
            className={`${inputClass} w-1/2`}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <input
            placeholder="Unit"
            className={`${inputClass} w-1/2`}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <input
          placeholder="Location"
          className={inputClass}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
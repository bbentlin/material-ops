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
  const [partNumber, setPartNumber] = useState("");
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
        body: JSON.stringify({ name, partNumber, description, quantity, unit, location }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add material");
      }
    });
  }

  return (
    <DraggableModal className="w-96">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Add New Material</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="add-name" className="text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="add-name"
            placeholder="e.g. Steel Rod"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="add-partNumber" className="text-sm font-medium text-gray-700">
            Part Number <span className="text-red-500">*</span>
          </label>
          <input
            id="add-partNumber"
            placeholder="e.g. SR-001"
            className={inputClass}
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="add-description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            id="add-description"
            placeholder="Optional description"
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-1/2">
            <label htmlFor="add-quantity" className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="add-quantity"
              type="number"
              min={0}
              placeholder="0"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1 w-1/2">
            <label htmlFor="add-unit" className="text-sm font-medium text-gray-700">
              Unit
            </label>
            <input
              id="add-unit"
              placeholder="e.g. pieces"
              className={inputClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="add-location" className="text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="add-location"
            placeholder="e.g. Warehouse A"
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            {isPending ? "Adding..." : "Add Material"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
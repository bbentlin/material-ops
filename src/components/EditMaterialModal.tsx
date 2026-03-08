"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

type Material = {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit?: string;
  location?: string;
};

export default function EditMaterialModal({
  material,
  canDelete = true,
  onCloseAction,
  onSuccessAction,
}: {
  material: Material;
  canDelete?: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [name, setName] = useState(material.name);
  const [partNumber, setPartNumber] = useState(material.partNumber);
  const [description, setDescription] = useState(material.description ?? "");
  const [quantity, setQuantity] = useState(material.quantity);
  const [unit, setUnit] = useState(material.unit ?? "pieces");
  const [location, setLocation] = useState(material.location ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, partNumber, description, quantity, unit, location }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update material");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${material.name}"?`)) return;
    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/materials/${material.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete material");
      }
    });
  }

  return (
    <DraggableModal className="w-96">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Material</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-name"
            placeholder="e.g. Steel Rod"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-partNumber" className="text-sm font-medium text-gray-700">
            Part Number <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-partNumber"
            placeholder="e.g. SR-001"
            className={inputClass}
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            id="edit-description"
            placeholder="Optional description"
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-1/2">
            <label htmlFor="edit-quantity" className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="edit-quantity"
              type="number"
              min={0}
              placeholder="0"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1 w-1/2">
            <label htmlFor="edit-unit" className="text-sm font-medium text-gray-700">
              Unit
            </label>
            <input
              id="edit-unit"
              placeholder="e.g. pieces"
              className={inputClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-location" className="text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="edit-location"
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
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded transition-colors disabled:opacity-50 mt-1"
          >
            Delete Material
          </button>
        )}
      </form>
    </DraggableModal>
  );
}
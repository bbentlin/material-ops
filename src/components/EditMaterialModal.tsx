"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

type Material = {
  id: string;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  unit?: string;
  location?: string;
};

export default function EditMaterialModal({
  material,
  onCloseAction,
  onSuccessAction,
}: {
  material: Material;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [name, setName] = useState(material.name);
  const [sku, setSku] = useState(material.sku);
  const [description, setDescription] = useState(material.description ?? "");
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
        body: JSON.stringify({ name, sku, description, unit, location }),
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
      <form
        action={handleSubmit}
        className="p-6 flex flex-col gap-3"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-2">Edit Material</h2>
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
        <input
          placeholder="Unit"
          className={inputClass}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
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
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded transition-colors disabled:opacity-50 mt-1"
        >
          Delete Material
        </button>
      </form>
    </DraggableModal>
  );
}
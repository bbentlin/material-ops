"use client";

import { useEffect, useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

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
  const [minQuantity, setMinQuantity] = useState(10);
  const [unit, setUnit] = useState("pieces");
  const [location, setLocation] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          partNumber,
          description,
          quantity,
          unit,
          location,
          minQuantity,
          departmentId: departmentId || null,
        }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add material");
      }
    });
  }

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => (r.ok ? r.json() : []))
      .then(setDepartments)
      .catch(() => {});
  }, []);

  return (
    <DraggableModal>
      <form action={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">Add New Material</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="add-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <label htmlFor="add-partNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <label htmlFor="add-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="add-department" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Department
          </label>
          <select
            id="add-department"
            className={inputClass}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">No department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="add-quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

          <div className="flex flex-col gap-1">
            <label htmlFor="add-unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <label htmlFor="add-location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="add-minQuantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Low Stock Threshold
          </label>
          <input
            id="add-minQuantity"
            type="number"
            min={0}
            placeholder="10"
            className={inputClass}
            value={minQuantity}
            onChange={(e) => setMinQuantity(Number(e.target.value))}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">Alert when stock falls to or below this level</span>
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
            {isPending ? "Adding..." : "Add Material"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
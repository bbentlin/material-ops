"use client";

import { useEffect, useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";
import { WithStringifiedURLs } from "next/dist/lib/metadata/types/metadata-interface";

const inputClass = 
"border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

type MaterialOption = {
  id: string;
  name: string;
  partNumber: string;
  unit: string;
};

type LineItem = {
  materialId: string;
  quantity: number;
  unitPrice: number | null;
};

type ExistingOrder = {
  id: string;
  orderNumber: string;
  supplier: string;
  notes?: string | null;
  expectedDate?: string | null; 
  items: {
    materialId: string;
    quantity: number;
    unitPrice: number | null;
  }[];
};

export default function PurchaseOrderModal({
  order,
  onCloseAction,
  onSuccessAction,
}: {
  order?: ExistingOrder | null;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const isEdit = !!order;
  const [supplier, setSupplier] = useState(order?.supplier || "");
  const [notes, setNotes] = useState(order?.notes || "");
  const [expectedDate, setExpectedDate] = useState(
    order?.expectedDate ? new Date(order.expectedDate).toISOString().slice(0, 10) : ""
  );
  const [items, setItems] = useState<LineItem[]>(
    order?.items?.map((i) => ({
      materialId: i.materialId,
      quantity: i.quantity,
      unitPrice: i.unitPrice ?? null,
    })) || [{ materialId: "", quantity: 1, unitPrice: null }]
  );
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/materials?all=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data.materials || [];
        setMaterials(list.map((m: MaterialOption) => ({ id: m.id, name: m.name, partNumber: m.partNumber, unit: m.unit })));
      })
      .catch(() => {});
  }, []);

  function addItem() {
    setItems((prev) => [...prev, { materialId: "", quantity: 1, unitPrice: null }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number | null) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      setError("");

      const validItems = items.filter((i) => i.materialId && i.quantity > 0);
      if (!supplier.trim()) {
        setError("Supplier is required");
        return;
      }

      const payload = {
        supplier: supplier.trim(),
        notes: notes.trim() || null,
        expectedDate: expectedDate || null,
        items: validItems.map((i) => ({
          materialId: i.materialId,
          quantity: i.quantity,
          ...(i.unitPrice != null ? { unitPrice: i.unitPrice } : {}),
        })),
      };

      const url = isEdit ? `/api/purchase-orders/${order!.id}` : "/api/purchase-orders";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save purchase order");
      }
    });
  }

  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalCost = items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);

  return (
    <DraggableModal className="w-135">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          {isEdit ? `Edit ${order!.orderNumber}` : "📋 New Purchase Order"}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Supplier <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="e.g. Acme Industrial Supply"
            className={inputClass}
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Delivery
            </label>
            <input
              type="date"
              className={inputClass}
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <input
              placeholder="Optional notes"
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Line Items <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
               + Add Item
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-2 items-start p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <select
                  className={`${inputClass} flex-1 text-sm`}
                  value={item.materialId}
                  onChange={(e) => updateItem(idx, "materialId", e.target.value)}
                  required
                >
                  <option value="">Select material...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.partNumber} - {m.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  className={`${inputClass} w-20 text-sm`}
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", Math.max(1, Number(e.target.value)))}
                  required
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Price"
                  className={`${inputClass} w-24 text-sm`}
                  value={item.unitPrice ?? ""}
                  onChange={(e) => 
                    updateItem(idx, "unitPrice", e.target.value ? Number(e.target.value) : null)
                  }
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-600 text-lg leading-none mt-1"
                    title="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Totals row */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>{items.length} line item{items.length !== 1 ? "s" : ""} · {totalQty} total units</span>
            {totalCost > 0 && <span>Est. ${totalCost.toFixed(2)}</span>}
          </div>
        </div>

        {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCloseAction}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Order" : "Create Order"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
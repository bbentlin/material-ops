"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PurchaseOrderModal from "@/components/PurchaseOrderModal";
import Toast, { ToastMessage } from "@/components/Toast";
import { draftMode } from "next/headers";

type POItem = {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: number | null;
  receivedQty: number;
  material: { id: string; name: string; partNumber: string; unit: string };
};

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  status: string;
  supplier: string;
  notes?: string | null;
  expectedDate?: string | null;
  totalItems: number;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  approvedBy?: {id: string; name: string } | null;
  items: POItem[];
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  RECEIVED: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const statusIcons: Record<string, string> = {
  DRAFT: "📝",
  SUBMITTED: "📨",
  APPROVED: "✅",
  RECEIVED: "📦",
  CANCELLED: "❌",
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const limit = 15;

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = 
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function addToast(text: string, type: ToastMessage["type"] = "success") {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), text, type }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/purchase-orders?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUserRole(data.role);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";
  const canDelete = userRole === "ADMIN";
  const canApprove = userRole === "ADMIN";
  const totalPages = Math.ceil(total / limit);

  async function handleStatusChange(orderId: string, newStatus: string) {
    const res = await fetch(`/api/purchase-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      addToast(`Order ${newStatus.toLowerCase()} successfully`);
      fetchOrders();
    } else {
      const data = await res.json();
      addToast(data.error || "Action failed", "error");
    }
  }

  async function handleReceive(orderId: string) {
    const res = await fetch(`/api/purchase-orders/${orderId}/receive`, {
      method: "POST",
    });
    if (res.ok) {
      addToast("Order received - stock updated!", "success");
      fetchOrders();
    } else {
      const data = await res.json();
      addToast(data.error || "Failed to receive order", "error");
    }
  }

  async function handleDelete(orderId: string, orderNumber: string) {
    if (!confirm(`Delete ${orderNumber}? This cannot be undone.`)) return;
    const res = await fetch(`/api/purchase-orders/${orderId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      addToast("Order deleted");
      fetchOrders();
    } else {
      const data = await res.json();
      addToast(data.error || "Failed to delete", "error");
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? "dark" : ""}`}>
      <Toast messages={toasts} onDismissAction={dismissToast} />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300"
            >
              ← Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              📋 Purchase Orders
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search orders..."
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 w-56 focus:outline-none focus-ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {canEdit && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + New Order
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {["ALL", "DRAFT", "SUBMITTED", "APPROVED", "RECEIVED"].map((s) => {
            const count =
              s === "ALL"
                ? total
                : orders.filter((o) => o.status === s).length;
            const isActive = s === "ALL" ? !statusFilter : statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s === "ALL" ? "" : s);
                  setPage(1);
                }}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
                }`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {s === "ALL" ? "📊 All" : `${statusIcons[s]} ${s.charAt(0) + s.slice(1).toLowerCase()}`}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {s === "ALL" ? total : count}
                </div>
              </button>
            );
          })}
        </div>

        {/* Orders table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
              No purchase orders found.{" "}
              {canEdit && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create one
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Order #</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Expected</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                      onClick={() =>
                       setExpandedId(expandedId === order.id ? null : order.id) 
                      }
                    >
                      <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-gray-100">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            statusColors[order.status] || ""
                          }`}
                        >
                          {statusIcons[order.status]} {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {order.supplier}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.items.length} lines · {order.totalItems} units
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.expectedDate
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                        <div className="text-gray-400">{order.createdBy.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Status transitions */}
                          {canEdit && order.status === "DRAFT" && (
                            <button
                              onClick={() =>
                                handleStatusChange(order.id, "SUBMITTED")
                              }
                              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium"
                            >
                              Submit
                            </button>
                          )}
                          {canApprove && order.status === "SUBMITTED" && (
                            <button
                              onClick={() =>
                                handleStatusChange(order.id, "APPROVED")
                              }
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 font-medium"
                            >
                              Approve
                            </button>
                          )}
                          {canEdit && order.status === "APPROVED" && (
                            <button
                              onClick={() => handleReceive(order.id)}
                              className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60 font-medium"
                            >
                              Receive
                            </button>
                          )}
                          {canEdit && order.status === "DRAFT" && (
                            <button
                              onClick={() => setEditOrder(order)}
                              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium"
                            >
                              Edit
                            </button>
                          )}
                          {canEdit && 
                            order.status !== "RECEIVED" &&
                            order.status !== "CANCELLED" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(order.id, "CANCELLED")
                                }
                                className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          {canDelete && order.status === "RECEIVED" && (
                            <button
                              onClick={() =>
                                handleDelete(order.id, order.orderNumber)
                              }
                              className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded detail */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-1 mg;grid-cols-2 gap-4">
                            {/* Line Items */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                Line Items
                              </h4>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-400 dark:text-gray-500">
                                    <th className="text-left py-1">Material</th>
                                    <th className="text-right py-1">Qty</th>
                                    <th className="text-right py-1">Price</th>
                                    {order.status === "RECEIVED" && (
                                      <th className="text-right py-1">Recv</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="border-t border-gray-100 dark:border-gray-700"
                                    >
                                      <td className="py-1.5 text-gray-700 dark:text-gray-300">
                                        <span className="font-mono text-gray-400 dark:text-gray-500">
                                          {item.material.partNumber}
                                        </span>{" "}
                                        {item.material.name}
                                      </td>
                                      <td className="py-1.5 text-right text-gray-700 dark:text-gray-300">
                                        {item.quantity} {item.material.unit}
                                      </td>
                                      <td className="py-1.5 text-right text-gray-500 dark:text-gray-400">
                                        {item.unitPrice != null
                                          ? `$${item.unitPrice.toFixed(2)}`
                                          : "-"}
                                      </td>
                                      {order.status === "RECEIVED" && (
                                        <td className="py-1.5 text-right text-green-600 dark:text-green-400">
                                          {item.receivedQty}
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Order Info */}
                            <div className="text-xs space-y-1.5">
                              <h4 className="font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                Details
                              </h4>
                              <div className="text-gray-600 dark:text-gray-400">
                                <strong>Created by:</strong>{" "}
                                {order.createdBy.name} ({order.createdBy.email})
                              </div>
                              {order.approvedBy && (
                                <div className="text-gray-600 dark:text-gray-400">
                                  <strong>Approved by:</strong>{" "}
                                  {order.approvedBy.name}
                                </div>
                              )}
                              {order.notes && (
                                <div className="text-gray-600 dark:text-gray-400">
                                  <strong>Notes:</strong> {order.notes}
                                </div>
                              )}
                              {order.receivedAt && (
                                <div className="text-gray-600 dark:text-gray-400">
                                  <strong>Received:</strong>{" "}
                                  {new Date(order.receivedAt).toLocaleString()}
                                </div>
                              )}
                              {order.items.some((i) => i.unitPrice != null) && (
                                <div className="text-gray-700 dark:text-gray-300 font-medium pt-1">
                                  <strong>Total Cost:</strong> $
                                  {order.items
                                    .reduce(
                                      (sum, i) =>
                                        sum +
                                        i.quantity * (i.unitPrice || 0),
                                      0
                                    )
                                    .toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages} · {total} order{total !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreate && (
        <PurchaseOrderModal
          onCloseAction={() => setShowCreate(false)}
          onSuccessAction={() => {
            setShowCreate(false);
            addToast("Purchase order created");
            fetchOrders();
          }}
        />
      )}
      {editOrder && (
        <PurchaseOrderModal
          order={editOrder}
          onCloseAction={() => setEditOrder(null)}
          onSuccessAction={() => {
            setEditOrder(null);
            addToast("Purchase order updated");
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
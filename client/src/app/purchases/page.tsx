"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Eye, Download } from "lucide-react";
import {
  useGetPurchaseOrdersQuery,
  useDeletePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  OrderStatus,
  PurchaseOrder,
} from "@/state/api";
import Header from "@/app/(components)/Header";
import { exportCsv } from "@/lib/exportCsv";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Ordered: "bg-blue-100 text-blue-700",
  Received: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUSES: OrderStatus[] = ["Draft", "Ordered", "Received", "Cancelled"];

export default function PurchasesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);

  const { data: orders = [], isLoading } = useGetPurchaseOrdersQuery(
    statusFilter as OrderStatus || undefined
  );
  const [deleteOrder] = useDeletePurchaseOrderMutation();
  const [updateOrder] = useUpdatePurchaseOrderMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteOrder(deleteTarget.orderId);
    setDeleteTarget(null);
  };

  const handleStatusChange = async (order: PurchaseOrder, newStatus: OrderStatus) => {
    await updateOrder({ orderId: order.orderId, status: newStatus });
  };

  const handleExport = () => {
    exportCsv(
      orders.map((o) => ({
        orderId: o.orderId,
        supplier: o.supplier?.name ?? "",
        status: o.status,
        totalCost: o.totalCost,
        notes: o.notes ?? "",
        createdAt: o.createdAt,
      })),
      "purchase-orders"
    );
  };

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Header name="Purchase Orders" />
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} orders</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => router.push("/purchases/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Order</span>
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            statusFilter === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No purchase orders found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Items</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Total Cost</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {order.orderId.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {order.supplier?.name ?? <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        disabled={order.status === "Received" || order.status === "Cancelled"}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 outline-none ${STATUS_COLORS[order.status]} disabled:opacity-60`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      Rp {order.totalCost.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/purchases/${order.orderId}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition"
                          title="View detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(order.status === "Draft" || order.status === "Cancelled") && (
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Purchase Order</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete order{" "}
              <span className="font-mono font-semibold">{deleteTarget.orderId.slice(0, 8)}…</span>?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

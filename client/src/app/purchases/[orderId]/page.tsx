"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
  OrderStatus,
} from "@/state/api";
import Breadcrumb from "@/app/(components)/Breadcrumb";
import { ArrowLeft } from "lucide-react";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Ordered: "bg-blue-100 text-blue-700",
  Received: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Draft: ["Ordered", "Cancelled"],
  Ordered: ["Received", "Cancelled"],
  Received: [],
  Cancelled: [],
};

export default function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useGetPurchaseOrderQuery(orderId);
  const [updateOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

  const handleStatusChange = async (status: OrderStatus) => {
    await updateOrder({ orderId, status });
  };

  if (isLoading) return <div className="px-4 py-16 text-center text-gray-400">Loading…</div>;
  if (!order) return <div className="px-4 py-16 text-center text-gray-400">Order not found.</div>;

  const transitions = TRANSITIONS[order.status];

  return (
    <div className="pb-10 w-full">
      <Breadcrumb
        items={[{ label: "Purchase Orders", href: "/purchases" }, { label: orderId.slice(0, 8) + "…" }]}
      />

      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/purchases")}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{order.orderId}</p>
        </div>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Supplier</p>
            <p className="font-medium text-gray-800">{order.supplier?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Created</p>
            <p className="font-medium text-gray-800">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {order.notes && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xs mb-1">Notes</p>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Line Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Product</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Qty</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Unit Cost</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.itemId}>
                <td className="px-6 py-3 text-gray-800">{item.product?.name ?? item.productId}</td>
                <td className="px-6 py-3 text-right text-gray-600">{item.quantity}</td>
                <td className="px-6 py-3 text-right text-gray-600">
                  Rp {item.unitCost.toLocaleString("en-US")}
                </td>
                <td className="px-6 py-3 text-right font-semibold text-gray-800">
                  Rp {(item.quantity * item.unitCost).toLocaleString("en-US")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right font-semibold text-gray-700">
                Total Cost
              </td>
              <td className="px-6 py-3 text-right font-bold text-blue-600">
                Rp {order.totalCost.toLocaleString("en-US")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Status transition buttons */}
      {transitions.length > 0 && (
        <div className="flex gap-3">
          {transitions.map((next) => (
            <button
              key={next}
              onClick={() => handleStatusChange(next)}
              disabled={isUpdating}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition disabled:opacity-60 ${
                next === "Cancelled"
                  ? "border border-red-300 text-red-600 hover:bg-red-50"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isUpdating ? "Updating…" : `Mark as ${next}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

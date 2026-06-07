"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  useCreatePurchaseOrderMutation,
  useGetProductsQuery,
  useGetSuppliersQuery,
} from "@/state/api";
import Breadcrumb from "@/app/(components)/Breadcrumb";
import Link from "next/link";

const inputCls =
  "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-gray-400";
const selectCls = inputCls + " appearance-none";

interface LineItem {
  productId: string;
  quantity: string;
  unitCost: string;
}

const emptyItem = (): LineItem => ({ productId: "", quantity: "", unitCost: "" });

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: products = [] } = useGetProductsQuery();
  const { data: suppliers = [] } = useGetSuppliersQuery();
  const [createOrder] = useCreatePurchaseOrderMutation();

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof LineItem, value: string) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const totalCost = items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0;
    const c = parseFloat(item.unitCost) || 0;
    return sum + q * c;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validItems = items.filter(
      (it) => it.productId && parseFloat(it.quantity) > 0 && parseFloat(it.unitCost) >= 0
    );
    if (!validItems.length) {
      setError("Add at least one valid line item.");
      return;
    }
    try {
      setIsSubmitting(true);
      await createOrder({
        supplierId: supplierId || undefined,
        notes: notes || undefined,
        items: validItems.map((it) => ({
          productId: it.productId,
          quantity: parseInt(it.quantity),
          unitCost: parseFloat(it.unitCost),
        })),
      }).unwrap();
      router.push("/purchases");
    } catch {
      setError("Failed to create purchase order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-10 w-full">
      <Breadcrumb items={[{ label: "Purchase Orders", href: "/purchases" }, { label: "New Order" }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">New Purchase Order</h1>
        <p className="text-sm text-gray-400 mt-1">Create a draft purchase order for your supplier.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Supplier + Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Supplier <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— No supplier —</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Q3 restock"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Line Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(i, "productId", e.target.value)}
                        required
                        className={selectCls}
                      >
                        <option value="">Select product…</option>
                        {products.map((p) => (
                          <option key={p.productId} value={p.productId}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min={0}
                        placeholder="Unit cost (Rp)"
                        value={item.unitCost}
                        onChange={(e) => updateItem(i, "unitCost", e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <span className="text-sm font-semibold text-gray-700">
                  Total:{" "}
                  <span className="text-blue-600">Rp {totalCost.toLocaleString("id-ID")}</span>
                </span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Order will be saved as <strong>Draft</strong>.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/purchases"
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition"
              >
                {isSubmitting ? "Creating…" : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

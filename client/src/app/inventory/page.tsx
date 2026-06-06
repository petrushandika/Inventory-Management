"use client";

import { useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from "@/state/api";
import { Edit2, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../(components)/Header";
import { Product } from "@/state/api";
import EditProductModal from "../products/EditProductModal";
import { formatRupiah } from "@/lib/currency";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";

type SortKey = "name" | "price" | "rating" | "stockQuantity";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timerRef.current);
  }, [searchTerm]);

  const { data: products, isError, isLoading } = useGetProductsQuery(debouncedSearch);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const getValue = useCallback((p: Product, k: SortKey) => {
    if (k === "name") return p.name;
    if (k === "price") return p.price;
    if (k === "rating") return p.rating ?? 0;
    if (k === "stockQuantity") return p.stockQuantity;
    return undefined;
  }, []);

  const { sorted, sort, toggle } = useSort<Product, SortKey>(products, getValue);

  const handleUpdate = async (data: Product) => {
    const { productId, ...rest } = data;
    await updateProduct({ productId, ...rest }).unwrap().catch(console.error);
    setEditTarget(null);
  };
  const handleDelete = async (productId: string) => {
    await deleteProduct(productId).unwrap().catch(console.error);
    setDeleteConfirm(null);
  };

  const th = (label: string, key: SortKey, className = "") => (
    <th
      className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 cursor-pointer select-none group ${className}`}
      onClick={() => toggle(key)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon dir={sort.dir} active={sort.key === key} />
      </span>
    </th>
  );

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Header name="Inventory" />
          <p className="text-sm text-gray-400 mt-0.5">{products ? `${products.length} items in stock` : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          <input
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-48 sm:w-52 transition-all"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">Loading inventory...</div>
        ) : isError || !products ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">Failed to load inventory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 hidden sm:table-cell">Product ID</th>
                  {th("Name", "name")}
                  {th("Price", "price")}
                  {th("Rating", "rating", "hidden md:table-cell")}
                  {th("Stock", "stockQuantity")}
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-gray-400 font-mono">{product.productId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-gray-800">{product.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{formatRupiah(product.price)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-700">{product.rating != null ? product.rating.toFixed(1) : "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-800">{product.stockQuantity.toLocaleString("en-US")}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stockQuantity > 100 ? "bg-green-50 text-green-700"
                        : product.stockQuantity > 20 ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                      }`}>
                        {product.stockQuantity > 100 ? "In Stock" : product.stockQuantity > 20 ? "Low Stock" : "Critical"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.productId)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTarget && <EditProductModal product={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove this product from inventory?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

"use client";

import { useDeleteProductMutation, useGetProductsQuery, Product } from "@/state/api";
import { Edit2, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "../(components)/Header";
import ExportReportMenu from "@/app/(components)/ExportReportMenu";
import StockStatusBadge from "@/app/(components)/StockStatusBadge";
import { getStockStatus } from "@/lib/stockStatus";
import { formatRupiah } from "@/lib/currency";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";
import Pagination from "@/app/(components)/Pagination";
import DeleteModal from "@/app/(components)/DeleteModal";

type SortKey = "name" | "price" | "rating" | "stockQuantity";

const Inventory = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [searchTerm]);

  const { data: products, isError, isLoading } = useGetProductsQuery(debouncedSearch);
  const [deleteProduct] = useDeleteProductMutation();

  const getValue = useCallback((p: Product, k: SortKey) => {
    if (k === "name") return p.name;
    if (k === "price") return p.price;
    if (k === "rating") return p.rating ?? 0;
    if (k === "stockQuantity") return p.stockQuantity;
    return undefined;
  }, []);
  const { sorted: allSorted, sort, toggle } = useSort<Product, SortKey>(products, getValue);
  const sorted = pageSize === 0 ? allSorted : allSorted.slice((page - 1) * pageSize, page * pageSize);

  const reportData = allSorted.map((p) => ({
    name: p.name,
    price: p.price,
    stock: p.stockQuantity,
    minStock: p.minStock ?? 20,
    status: getStockStatus(p.stockQuantity, p.minStock ?? 20),
    rating: p.rating ?? "",
  }));

  const th = (label: string, key: SortKey, cls = "") => (
    <th className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group ${cls}`} onClick={() => toggle(key)}>
      <span className="inline-flex items-center">{label}<SortIcon dir={sort.dir} active={sort.key === key} /></span>
    </th>
  );

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Header name="Inventory" />
          <p className="text-sm text-gray-400 mt-0.5">{products ? `${products.length} items in stock` : ""}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-44 sm:w-52 transition-all"
              placeholder="Search inventory…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <ExportReportMenu
            data={reportData}
            filename="inventory"
            title="Inventory Report"
            disabled={!allSorted.length}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" /></div>
        ) : isError || !products ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">Failed to load inventory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">ID</th>
                  {th("Name", "name")}
                  {th("Price", "price")}
                  {th("Rating", "rating", "hidden md:table-cell")}
                  {th("Stock", "stockQuantity")}
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Min Stock</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-gray-400 font-mono">{product.productId.slice(0, 8)}…</span></td>
                    <td className="px-4 py-3"><span className="text-sm font-semibold text-gray-800">{product.name}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-700">{formatRupiah(product.price)}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-gray-700">{product.rating != null ? product.rating.toFixed(1) : "—"}</span></td>
                    <td className="px-4 py-3"><span className="text-sm font-medium text-gray-800">{product.stockQuantity.toLocaleString("en-US")}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-gray-600">{product.minStock ?? 20}</span></td>
                    <td className="px-4 py-3">
                      <StockStatusBadge stockQuantity={product.stockQuantity} minStock={product.minStock ?? 20} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/products/${product.productId}/edit`)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={allSorted.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          title="Remove from Inventory"
          description={<>Are you sure you want to delete <span className="font-medium text-gray-800">{deleteTarget.name}</span>? This action cannot be undone.</>}
          onConfirm={async () => { await deleteProduct(deleteTarget.productId).unwrap().catch(console.error); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

const InventoryPage = () => (
  <Suspense>
    <Inventory />
  </Suspense>
);

export default InventoryPage;

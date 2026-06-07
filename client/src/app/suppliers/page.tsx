"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Edit2, Trash2, Truck } from "lucide-react";
import { useGetSuppliersQuery, useDeleteSupplierMutation, Supplier } from "@/state/api";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";
import Header from "@/app/(components)/Header";
import Pagination from "@/app/(components)/Pagination";

type SortKey = "name" | "email" | "purchases";

const DeleteModal = ({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Supplier</h3>
      <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-800">{name}</span>? This action cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const SuppliersPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const { data: rawSuppliers, isLoading, isError } = useGetSuppliersQuery(search || undefined);
  const [deleteSupplier] = useDeleteSupplierMutation();

  const getValue = useCallback((s: Supplier, k: SortKey) => {
    if (k === "name") return s.name;
    if (k === "email") return s.email ?? "";
    if (k === "purchases") return s._count?.Purchases ?? 0;
    return undefined;
  }, []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { sorted: allSuppliers, sort, toggle } = useSort<Supplier, SortKey>(rawSuppliers, getValue);
  const suppliers = pageSize === 0 ? allSuppliers : allSuppliers.slice((page - 1) * pageSize, page * pageSize);

  const th = (label: string, key: SortKey, cls = "") => (
    <th className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group ${cls}`} onClick={() => toggle(key)}>
      <span className="inline-flex items-center">{label}<SortIcon dir={sort.dir} active={sort.key === key} /></span>
    </th>
  );

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Header name="Suppliers" />
          <p className="text-sm text-gray-400 mt-0.5">{rawSuppliers ? `${rawSuppliers.length} suppliers` : ""}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers…"
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-44 sm:w-52 transition-all" />
          </div>
          <button onClick={() => router.push("/suppliers/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0">
            <PlusCircle className="w-4 h-4" /><span className="hidden sm:inline">Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500 text-sm">Failed to load suppliers.</div>
        ) : !suppliers?.length ? (
          <div className="text-center py-12 text-gray-400"><Truck className="w-10 h-10 mx-auto mb-3 text-gray-300" /><p className="text-sm">No suppliers yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {th("Name", "name")}
                  {th("Email", "email", "hidden md:table-cell")}
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Phone</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden xl:table-cell">Address</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group hidden sm:table-cell" onClick={() => toggle("purchases")}>
                    <span className="inline-flex items-center justify-end">Orders<SortIcon dir={sort.dir} active={sort.key === "purchases"} /></span>
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {suppliers.map((sup) => (
                  <tr key={sup.supplierId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{sup.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 hidden md:table-cell">{sup.email || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-4 text-gray-500 hidden lg:table-cell">{sup.phone || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-4 text-gray-500 hidden xl:table-cell max-w-xs truncate">{sup.address || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-4 text-right hidden sm:table-cell">
                      <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-full">{sup._count?.Purchases ?? 0} orders</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/suppliers/${sup.supplierId}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(sup)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={allSuppliers.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name}
          onConfirm={async () => { await deleteSupplier(deleteTarget.supplierId).unwrap().catch(console.error); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default SuppliersPage;

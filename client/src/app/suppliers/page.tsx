"use client";

import React, { useCallback, useState } from "react";
import { PlusCircle, Search, Edit2, Trash2, Truck, Phone, Mail, MapPin, X } from "lucide-react";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  Supplier,
} from "@/state/api";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";

type SortKey = "name" | "email" | "purchases";

type FormState = { name: string; email: string; phone: string; address: string };
const emptyForm: FormState = { name: "", email: "", phone: "", address: "" };

const SupplierModal = ({
  initial, onSave, onClose,
}: {
  initial?: Supplier;
  onSave: (data: FormState) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<FormState>(
    initial
      ? { name: initial.name, email: initial.email ?? "", phone: initial.phone ?? "", address: initial.address ?? "" }
      : emptyForm
  );

  const field = (label: string, key: keyof FormState, placeholder: string, icon: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{initial ? "Edit Supplier" : "Add Supplier"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
          {field("Email", "email", "supplier@company.com", <Mail size={14} />)}
          {field("Phone Number", "phone", "+1 (555) 000-0000", <Phone size={14} />)}
          {field("Address", "address", "123 Main St, City, Country", <MapPin size={14} />)}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button
              onClick={() => { if (form.name.trim()) onSave(form); }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {initial ? "Save Changes" : "Add Supplier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuppliersPage = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | Supplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null);

  const { data: rawSuppliers, isLoading, isError } = useGetSuppliersQuery(search || undefined);
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const getValue = useCallback((s: Supplier, k: SortKey) => {
    if (k === "name") return s.name;
    if (k === "email") return s.email ?? "";
    if (k === "purchases") return s._count?.Purchases ?? 0;
    return undefined;
  }, []);

  const { sorted: suppliers, sort, toggle } = useSort<Supplier, SortKey>(rawSuppliers, getValue);

  const th = (label: string, key: SortKey, className = "") => (
    <th
      className={`text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none group ${className}`}
      onClick={() => toggle(key)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon dir={sort.dir} active={sort.key === key} />
      </span>
    </th>
  );

  const handleSave = async (form: FormState) => {
    const payload = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
    };
    if (modal === "create") {
      await createSupplier(payload);
    } else if (modal) {
      await updateSupplier({ supplierId: (modal as Supplier).supplierId, ...payload });
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteSupplier(confirmDelete.supplierId);
    setConfirmDelete(null);
  };

  return (
    <div className="mx-auto pb-5 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage suppliers and vendors</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Supplier</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="pl-9 pr-4 py-2 w-full max-w-sm border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Failed to load suppliers</div>
      ) : !suppliers?.length ? (
        <div className="text-center py-12 text-gray-400">
          <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No suppliers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {th("Name", "name")}
                {th("Email", "email", "hidden md:table-cell")}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Address</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none group" onClick={() => toggle("purchases")}>
                  <span className="inline-flex items-center justify-end">Purchases <SortIcon dir={sort.dir} active={sort.key === "purchases"} /></span>
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suppliers.map((sup) => (
                <tr key={sup.supplierId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">{sup.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{sup.email || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">{sup.phone || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-4 text-gray-500 hidden xl:table-cell max-w-xs truncate">{sup.address || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-4 text-right hidden sm:table-cell">
                    <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-full">
                      {sup._count?.Purchases ?? 0} orders
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModal(sup)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(sup)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {modal && <SupplierModal initial={modal === "create" ? undefined : modal} onSave={handleSave} onClose={() => setModal(null)} />}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Supplier</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete <span className="font-medium text-gray-800">{confirmDelete.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;

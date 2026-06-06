"use client";

import React, { useCallback, useState } from "react";
import { PlusCircle, Search, Edit2, Trash2, Tag, X } from "lucide-react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
} from "@/state/api";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";

type SortKey = "name" | "products";

const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1",
  "#ec4899", "#0891b2", "#78716c", "#84cc16", "#f97316",
];

type FormState = { name: string; description: string; color: string };
const emptyForm: FormState = { name: "", description: "", color: "#3b82f6" };

const CategoryModal = ({
  initial, onSave, onClose,
}: {
  initial?: Category;
  onSave: (data: FormState) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<FormState>(
    initial
      ? { name: initial.name, description: initial.description ?? "", color: initial.color }
      : emptyForm
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{initial ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="e.g. Electronics"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="Brief description of this category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-500">{form.color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button
              onClick={() => { if (form.name.trim()) onSave(form); }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {initial ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesPage = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const { data: rawCategories, isLoading, isError } = useGetCategoriesQuery(search || undefined);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const getValue = useCallback((c: Category, k: SortKey) => {
    if (k === "name") return c.name;
    if (k === "products") return c._count?.Products ?? 0;
    return undefined;
  }, []);

  const { sorted: categories, sort, toggle } = useSort<Category, SortKey>(rawCategories, getValue);

  const handleSave = async (form: FormState) => {
    if (modal === "create") {
      await createCategory(form);
    } else if (modal) {
      await updateCategory({ categoryId: (modal as Category).categoryId, ...form });
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteCategory(confirmDelete.categoryId);
    setConfirmDelete(null);
  };

  return (
    <div className="mx-auto pb-5 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium">Sort:</span>
          {(["name", "products"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                sort.key === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {key === "name" ? "Name" : "Products"}
              <SortIcon dir={sort.dir} active={sort.key === key} />
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Failed to load categories</div>
      ) : !categories?.length ? (
        <div className="text-center py-12 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.categoryId} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "20" }}>
                  <Tag className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(cat)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-400">{cat._count?.Products ?? 0} products</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CategoryModal initial={modal === "create" ? undefined : modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Category</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete <span className="font-medium text-gray-800">{confirmDelete.name}</span>? This cannot be undone.
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

export default CategoriesPage;

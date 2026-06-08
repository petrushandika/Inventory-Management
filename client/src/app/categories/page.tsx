"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Edit2, Trash2, Tag } from "lucide-react";
import { useGetCategoriesQuery, useDeleteCategoryMutation, Category } from "@/state/api";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";
import Header from "@/app/(components)/Header";
import ExportReportMenu from "@/app/(components)/ExportReportMenu";

type SortKey = "name" | "products";

const DeleteModal = ({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Category</h3>
      <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-800">{name}</span>? This action cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const CategoriesPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: rawCategories, isLoading, isError } = useGetCategoriesQuery(search || undefined);
  const [deleteCategory] = useDeleteCategoryMutation();

  const getValue = useCallback((c: Category, k: SortKey) => {
    if (k === "name") return c.name;
    if (k === "products") return c._count?.Products ?? 0;
    return undefined;
  }, []);
  const { sorted: categories, sort, toggle } = useSort<Category, SortKey>(rawCategories, getValue);

  const reportData = (categories ?? []).map((c) => ({
    name: c.name,
    products: c._count?.Products ?? 0,
  }));

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Header name="Categories" />
          <p className="text-sm text-gray-400 mt-0.5">{rawCategories ? `${rawCategories.length} categories` : ""}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories…"
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-44 sm:w-52 transition-all" />
          </div>
          <ExportReportMenu
            data={reportData}
            filename="categories"
            title="Laporan Categories"
            disabled={!categories?.length}
          />
          <button onClick={() => router.push("/categories/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0">
            <PlusCircle className="w-4 h-4" /><span className="hidden sm:inline">Add Category</span>
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-gray-400 font-medium">Sort:</span>
        {(["name", "products"] as SortKey[]).map((key) => (
          <button key={key} onClick={() => toggle(key)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${sort.key === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}>
            {key === "name" ? "Name" : "Products"}
            <SortIcon dir={sort.dir} active={sort.key === key} />
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500 text-sm">Failed to load categories.</div>
      ) : !categories?.length ? (
        <div className="text-center py-12 text-gray-400"><Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" /><p className="text-sm">No categories yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.categoryId} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "20" }}>
                  <Tag className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => router.push(`/categories/${cat.categoryId}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-400 font-medium">{cat._count?.Products ?? 0} products</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name}
          onConfirm={async () => { await deleteCategory(deleteTarget.categoryId).unwrap().catch(console.error); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default CategoriesPage;

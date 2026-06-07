"use client";

import { useGetCategoriesQuery, useUpdateCategoryMutation } from "@/state/api";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Breadcrumb from "@/app/(components)/Breadcrumb";
import Link from "next/link";

const PRESET_COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#14b8a6", "#0891b2", "#78716c",
];

type FormState = { name: string; description: string; color: string };

const inputCls = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-gray-400";

const EditCategoryPage = () => {
  const router = useRouter();
  const { categoryId } = useParams<{ categoryId: string }>();

  const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery(undefined);
  const [updateCategory] = useUpdateCategoryMutation();

  const [form, setForm] = useState<FormState>({ name: "", description: "", color: "#3b82f6" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!categories) return;
    const c = categories.find((x) => x.categoryId === categoryId);
    if (!c) { router.replace("/categories"); return; }
    setForm({ name: c.name, description: c.description ?? "", color: c.color });
    setReady(true);
  }, [categories, categoryId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      await updateCategory({ categoryId, ...form }).unwrap();
      router.push("/categories");
    } catch {
      setError("Failed to update category. The name may already exist.");
      setIsSubmitting(false);
    }
  };

  if (loadingCategories || !ready) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="pb-10 w-full">
      <Breadcrumb items={[{ label: "Categories", href: "/categories" }, { label: "Edit Category" }]} />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-sm text-gray-500 mt-1">Update the category details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name <span className="text-red-400">*</span></label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description (optional)" className={inputCls} />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category Color</label>
              <div className="flex flex-wrap gap-2.5 mb-4">
                {PRESET_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`w-9 h-9 rounded-xl transition-all hover:scale-110 ${form.color === c ? "ring-2 ring-offset-2 ring-gray-500 scale-110" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                <span className="text-xs text-gray-500 font-medium">Custom:</span>
                <label className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors shrink-0">
                  <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-9 h-9 -ml-1 -mt-1 cursor-pointer border-0" />
                </label>
                <span className="text-sm font-mono text-gray-700">{form.color}</span>
                <span className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: form.color }} />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400"><span className="text-red-400">*</span> Required fields</p>
            <div className="flex items-center gap-3">
              <Link href="/categories" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2">
                {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryPage;

"use client";

import {
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
  Product,
} from "@/state/api";
import { Edit2, PlusCircle, Search, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import Image from "next/image";
import { formatRupiah } from "@/lib/currency";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";
import Pagination from "@/app/(components)/Pagination";

type SortKey = "name" | "price" | "stockQuantity" | "rating";
type FormState = { name: string; price: string; stockQuantity: string; rating: string; categoryId: string; imageFile: File | null; imagePreview: string };
const emptyForm = (): FormState => ({ name: "", price: "", stockQuantity: "", rating: "", categoryId: "", imageFile: null, imagePreview: "" });

const DeleteModal = ({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Product</h3>
      <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-800">{name}</span>? This cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const Products = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "");
  const [panel, setPanel] = useState<"edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const fileRef = useRef<HTMLInputElement>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timerRef.current);
  }, [searchTerm]);

  const { data: products, isLoading, isError } = useGetProductsQuery(debouncedSearch);
  const { data: categories } = useGetCategoriesQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const getValue = useCallback((p: Product, k: SortKey) => {
    if (k === "name") return p.name;
    if (k === "price") return p.price;
    if (k === "stockQuantity") return p.stockQuantity;
    if (k === "rating") return p.rating ?? 0;
    return undefined;
  }, []);
  const { sorted: allSorted, sort, toggle } = useSort<Product, SortKey>(products, getValue);
  const paged = pageSize === 0 ? allSorted : allSorted.slice((page - 1) * pageSize, page * pageSize);
  const sorted = paged;

  const openEdit = (p: Product) => {
    setForm({ name: p.name, price: String(p.price), stockQuantity: String(p.stockQuantity), rating: String(p.rating ?? ""), categoryId: p.categoryId ?? "", imageFile: null, imagePreview: p.image ?? "" });
    setEditTarget(p);
    setPanel("edit");
  };
  const closePanel = () => { setPanel(null); setEditTarget(null); setForm(emptyForm()); };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((res) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const imageBase64 = form.imageFile ? await getBase64(form.imageFile) : undefined;
    await updateProduct({
      productId: editTarget.productId,
      name: form.name.trim(),
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity),
      rating: form.rating ? parseFloat(form.rating) : undefined,
      categoryId: form.categoryId || undefined,
      image: imageBase64 ?? form.imagePreview,
    }).unwrap().catch(console.error);
    closePanel();
  };

  const th = (label: string, key: SortKey, cls = "") => (
    <th className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group ${cls}`} onClick={() => toggle(key)}>
      <span className="inline-flex items-center">{label}<SortIcon dir={sort.dir} active={sort.key === key} /></span>
    </th>
  );

  const FormPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:w-96 shrink-0">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">Edit Product</h2>
        <button onClick={closePanel} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Image</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
          >
            {form.imagePreview ? (
              <div className="relative h-36">
                <img src={form.imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, imageFile: null, imagePreview: "" })); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"><X className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Upload className="w-7 h-7 text-gray-300" />
                <span className="text-xs text-gray-400">Click to upload image</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Name <span className="text-red-400">*</span></label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Wireless Headphones"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
            <option value="">— No Category —</option>
            {categories?.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Price (Rp) <span className="text-red-400">*</span></label>
            <input required type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Stock <span className="text-red-400">*</span></label>
            <input required type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating (0–5)</label>
          <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            placeholder="0.0"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={closePanel} className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Header name="Products" />
          <p className="text-sm text-gray-400 mt-0.5">{products ? `${products.length} total products` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-48 sm:w-52 transition-all"
              placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => router.push("/products/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      <div className={`flex flex-col ${editTarget ? "lg:flex-row" : ""} gap-5`}>
        {/* Table */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" /></div>
          ) : isError || !products ? (
            <div className="flex items-center justify-center py-20 text-sm text-red-500">Failed to load products.</div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-12">Img</th>
                    {th("Name", "name")}
                    {th("Price", "price")}
                    {th("Stock", "stockQuantity")}
                    <th className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group ${editTarget ? "hidden xl:table-cell" : "hidden md:table-cell"}`} onClick={() => toggle("rating")}>
                      <span className="inline-flex items-center">Rating<SortIcon dir={sort.dir} active={sort.key === "rating"} /></span>
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((product) => (
                    <tr key={product.productId} className={`hover:bg-gray-50 transition-colors ${editTarget?.productId === product.productId ? "bg-blue-50/50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.image ? <Image src={product.image} alt={product.name} width={36} height={36} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800 leading-snug">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.productId.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm font-medium text-gray-800">{formatRupiah(product.price)}</span></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.stockQuantity > 100 ? "bg-green-50 text-green-700" : product.stockQuantity > 20 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                          {product.stockQuantity.toLocaleString("en-US")}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${editTarget ? "hidden xl:table-cell" : "hidden md:table-cell"}`}>
                        {product.rating != null ? <Rating rating={product.rating} /> : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
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

        {editTarget && FormPanel}
      </div>

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name}
          onConfirm={async () => { await deleteProduct(deleteTarget.productId).unwrap().catch(console.error); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

const ProductsPage = () => (
  <Suspense>
    <Products />
  </Suspense>
);

export default ProductsPage;

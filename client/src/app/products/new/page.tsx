"use client";

import { useCreateProductMutation, useGetCategoriesQuery, NewProduct } from "@/state/api";
import { Upload, X, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/(components)/Breadcrumb";
import Link from "next/link";

type FormState = {
  name: string;
  price: string;
  stockQuantity: string;
  minStock: string;
  rating: string;
  categoryId: string;
  imageFile: File | null;
  imagePreview: string;
};

const emptyForm = (): FormState => ({
  name: "", price: "", stockQuantity: "", minStock: "20", rating: "",
  categoryId: "", imageFile: null, imagePreview: "",
});

const inputCls = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-gray-400";

const NewProductPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useGetCategoriesQuery();
  const [createProduct] = useCreateProductMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be smaller than 5MB."); return; }
    setError("");
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((res) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const imageBase64 = form.imageFile ? await getBase64(form.imageFile) : undefined;
      const payload: NewProduct = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        minStock: parseInt(form.minStock) || 20,
        rating: form.rating ? parseFloat(form.rating) : undefined,
        categoryId: form.categoryId || undefined,
        image: imageBase64,
      };
      await createProduct(payload).unwrap();
      router.push("/products");
    } catch {
      setError("Failed to create product. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-10 w-full">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: "Add New Product" }]} />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a product to your inventory.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all overflow-hidden"
              >
                {form.imagePreview ? (
                  <div className="relative h-52">
                    <img src={form.imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, imageFile: null, imagePreview: "" })); }}
                      className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP · max 5MB</p>
                  </div>
                )}
              </div>
              {form.imageFile && <p className="text-xs text-gray-400 mt-1.5 truncate">{form.imageFile.name}</p>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <hr className="border-gray-100" />

            {/* Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Wireless Headphones Pro"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">— No Category —</option>
                  {categories?.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price, Stock, Min Stock, Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Stock <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                  placeholder="20"
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Rule 11: Tersedia &gt; min+5, Warning = min, Tidak Tersedia &lt; min-5</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0–5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                  placeholder="e.g. 4.5"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400"><span className="text-red-400">*</span> Required fields</p>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                ) : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductPage;

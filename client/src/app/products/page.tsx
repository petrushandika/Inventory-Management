"use client";

import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/state/api";
import { Edit2, PlusCircle, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import EditProductModal from "./EditProductModal";
import { NewProduct, Product } from "@/state/api";
import Image from "next/image";
import { formatRupiah } from "@/lib/currency";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreate = async (data: NewProduct) => {
    await createProduct(data).unwrap().catch(console.error);
  };

  const handleUpdate = async (data: Product) => {
    const { productId, ...rest } = data;
    await updateProduct({ productId, ...rest }).unwrap().catch(console.error);
    setEditTarget(null);
  };

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId).unwrap().catch(console.error);
    setDeleteConfirm(null);
  };

  return (
    <div className="pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Header name="Produk" />
          <p className="text-sm text-gray-400 mt-0.5">
            {products ? `${products.length} total produk` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-52 transition-all"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">Memuat produk...</div>
        ) : isError || !products ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">Gagal memuat produk.</div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">Tidak ada produk ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 w-16">Gambar</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Nama</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Harga</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Stok</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Rating</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{product.productId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatRupiah(product.price)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stockQuantity > 100 ? "bg-green-50 text-green-700"
                        : product.stockQuantity > 20 ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                      }`}>
                        {product.stockQuantity.toLocaleString("id-ID")} unit
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {product.rating != null ? <Rating rating={product.rating} /> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.productId)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
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

      <CreateProductModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
      {editTarget && <EditProductModal product={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Hapus Produk</h3>
            <p className="text-sm text-gray-500 mb-6">Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

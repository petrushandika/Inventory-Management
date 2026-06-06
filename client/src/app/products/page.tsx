"use client";

import { useCreateProductMutation, useGetProductsQuery } from "@/state/api";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import { NewProduct } from "@/state/api";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);

  const [createProduct] = useCreateProductMutation();

  const handleCreateProduct = async (productData: NewProduct) => {
    try {
      await createProduct(productData);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">
        Loading products...
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        Failed to fetch products. Please try again.
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Header name="Products" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={15}
            />
            <input
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-52 transition-all"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* PRODUCT GRID */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-sm">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3">
                <img
                  src={product.image || ""}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-1 w-full">
                {product.name}
              </h3>
              <p className="text-sm font-bold text-blue-600 mt-0.5">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Stock: {product.stockQuantity}
              </p>
              {product.rating != null && (
                <div className="mt-1.5">
                  <Rating rating={product.rating} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
};

export default Products;

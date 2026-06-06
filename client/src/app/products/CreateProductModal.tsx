"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Upload, X } from "lucide-react";
import Header from "@/app/(components)/Header";
import { NewProduct } from "@/state/api";

type ProductFormData = {
  name: string;
  image: File | null;
  price: number;
  stockQuantity: number;
  rating: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (productData: NewProduct) => void;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    image: null,
    price: 0,
    stockQuantity: 0,
    rating: 0,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

  const removeImage = () => setFormData((prev) => ({ ...prev, image: null }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let base64Image = "";
    if (formData.image) {
      base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(formData.image as File);
      });
    }

    onCreate({
      name: formData.name,
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      rating: formData.rating,
      image: base64Image || undefined,
    });

    setFormData({ name: "", image: null, price: 0, stockQuantity: 0, rating: 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Header name="Add New Product" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
              {formData.image ? (
                <div className="relative h-48">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-gray-300 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="contoh: Headphone Wireless"
                onChange={handleChange}
                value={formData.name}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                min="0"
                step="0.01"
                onChange={handleChange}
                value={formData.price}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                placeholder="0"
                min="0"
                onChange={handleChange}
                value={formData.stockQuantity}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (0–5)
              </label>
              <input
                type="number"
                name="rating"
                placeholder="0"
                min="0"
                max="5"
                step="0.1"
                onChange={handleChange}
                value={formData.rating}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                required
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;

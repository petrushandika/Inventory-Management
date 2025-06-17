"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { X } from "lucide-react";
import Header from "@/app/(components)/Header";

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
  onCreate: (formData: FormData) => void;
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
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("stockQuantity", formData.stockQuantity.toString());
    data.append("rating", formData.rating.toString());
    if (formData.image) {
      data.append("image", formData.image);
    }

    onCreate(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow w-full max-w-3xl p-8 overflow-y-auto max-h-[90vh]">
        <Header name="Create New Product" />
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>

            <div className="relative w-full h-48 border border-dashed border-gray-400 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
              {formData.image ? (
                <>
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    title="Remove Image"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
              )}
              {!formData.image && (
                <span className="text-gray-400">
                  Click or drop an image here
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              onChange={handleChange}
              value={formData.name}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              placeholder="Enter price"
              onChange={handleChange}
              value={formData.price}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stockQuantity"
              placeholder="Enter stock quantity"
              onChange={handleChange}
              value={formData.stockQuantity}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <input
              type="number"
              name="rating"
              placeholder="Enter rating"
              onChange={handleChange}
              value={formData.rating}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;

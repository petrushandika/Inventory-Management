"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { formatRupiah } from "@/lib/currency";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "@/app/(components)/Rating";
import Image from "next/image";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col h-full">
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[200px]">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold px-6 pt-5 pb-3 text-gray-800 shrink-0">Popular Products</h3>
          <hr className="border-gray-100" />
          <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
            {dashboardMetrics?.popularProducts?.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-300">{product.name[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-blue-600 text-xs">{formatRupiah(product.price)}</span>
                      <span className="text-gray-300">|</span>
                      <Rating rating={product.rating ?? 0} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {product.stockQuantity >= 1000 ? `${Math.round(product.stockQuantity / 1000)}k` : product.stockQuantity} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;

"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "@/app/(components)/Rating";
import Image from "next/image";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col min-h-[520px]">
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[200px]">
          <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold px-6 pt-5 pb-3 text-gray-800 shrink-0">
            Popular Products
          </h3>
          <hr className="border-gray-100" />
          <div className="overflow-y-auto flex-1">
            {dashboardMetrics?.popularProducts?.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={product.image || ""}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-blue-600 text-xs">
                        ${product.price.toFixed(2)}
                      </span>
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
                    {product.stockQuantity >= 1000
                      ? `${Math.round(product.stockQuantity / 1000)}k`
                      : product.stockQuantity}{" "}
                    units
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

"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import numeral from "numeral";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardPurchaseSummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const purchaseData = data?.purchaseSummary || [];

  const lastDataPoint = purchaseData[purchaseData.length - 1] ?? null;
  const isPositive = (lastDataPoint?.changePercentage ?? 0) >= 0;

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="shrink-0">
            <h2 className="text-base font-semibold px-6 pt-5 pb-3 text-gray-800">
              Purchase Summary
            </h2>
            <hr className="border-gray-100" />
          </div>

          {/* BODY */}
          <div className="px-6 pt-4 pb-3">
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-0.5">Last Purchase</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800">
                  {lastDataPoint
                    ? numeral(lastDataPoint.totalPurchased).format("$0.00a")
                    : "$0"}
                </p>
                {lastDataPoint?.changePercentage != null && (
                  <span
                    className={`flex items-center text-xs font-medium ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {Math.abs(lastDataPoint.changePercentage)}%
                  </span>
                )}
              </div>
            </div>

            {/* CHART */}
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={purchaseData}
                  margin={{ top: 5, right: 5, left: -40, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis tickLine={false} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString("en")}`,
                      "Purchased",
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPurchased"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#purchaseGradient)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;

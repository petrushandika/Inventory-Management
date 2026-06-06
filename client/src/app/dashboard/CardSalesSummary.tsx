"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardSalesSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();
  const salesData = data?.salesSummary || [];

  const [timeframe, setTimeframe] = useState("weekly");

  const totalValueSum = salesData.reduce((acc, curr) => acc + curr.totalValue, 0);

  const averageChangePercentage =
    salesData.length > 0
      ? salesData.reduce((acc, curr) => acc + (curr.changePercentage ?? 0), 0) /
        salesData.length
      : 0;

  const highestValueData = salesData.reduce(
    (acc, curr) => (acc.totalValue > curr.totalValue ? acc : curr),
    salesData[0] ?? { totalValue: 0, date: "" }
  );

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      })
    : "N/A";

  const isPositive = averageChangePercentage >= 0;

  if (isError) {
    return (
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex items-center justify-center min-h-[460px]">
        <p className="text-sm text-red-500">Failed to fetch sales data</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col min-h-[460px]">
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[200px]">
          <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="shrink-0">
            <h2 className="text-base font-semibold px-6 pt-5 pb-3 text-gray-800">
              Sales Summary
            </h2>
            <hr className="border-gray-100" />
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start px-6 pt-4 pb-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Total Value</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-gray-800">
                    $
                    {(totalValueSum / 1_000_000).toLocaleString("en", {
                      maximumFractionDigits: 2,
                    })}
                    m
                  </span>
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
                    {Math.abs(averageChangePercentage).toFixed(1)}%
                  </span>
                </div>
              </div>
              <select
                className="text-xs border border-gray-200 bg-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-400 cursor-pointer"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* CHART */}
            <div className="px-4 pb-4" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1_000_000).toFixed(0)}m`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString("en")}`,
                      "Sales",
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                  />
                  <Bar
                    dataKey="totalValue"
                    fill="#3b82f6"
                    barSize={8}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FOOTER */}
          <div className="shrink-0">
            <hr className="border-gray-100" />
            <div className="flex justify-between items-center px-6 py-3 text-xs text-gray-500">
              <span>{salesData.length} data points</span>
              <span>
                Peak:{" "}
                <span className="font-semibold text-gray-700">{highestValueDate}</span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;

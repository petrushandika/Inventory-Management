"use client";

import {
  ExpenseByCategorySummary,
  useGetExpensesByCategoryQuery,
} from "@/state/api";
import { useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type AggregatedDataItem = {
  name: string;
  color: string;
  amount: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  Office: "#3b82f6",
  Professional: "#10b981",
  Salaries: "#f59e0b",
  Other: "#8b5cf6",
};

const getColor = (category: string, index: number): string => {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const fallback = ["#ef4444", "#ec4899", "#06b6d4", "#84cc16"];
  return fallback[index % fallback.length];
};

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();

  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) =>
    new Date(dateString).toISOString().split("T")[0];

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: Record<string, AggregatedDataItem> = {};
    let idx = 0;

    expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .forEach((data: ExpenseByCategorySummary) => {
        if (!filtered[data.category]) {
          filtered[data.category] = {
            name: data.category,
            amount: 0,
            color: getColor(data.category, idx++),
          };
        }
        filtered[data.category].amount += parseInt(data.amount, 10);
      });

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const totalAmount = aggregatedData.reduce((sum, d) => sum + d.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">
        Loading expenses...
      </div>
    );
  }

  if (isError || !expensesData) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        Failed to fetch expenses. Please try again.
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <Header name="Expenses" />
        <p className="text-sm text-gray-400 mt-1">
          Visual breakdown of expenses by category and date range.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* FILTERS */}
        <div className="w-full lg:w-64 shrink-0 bg-white shadow-sm rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Category
              </label>
              <select
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Office">Office</option>
                <option value="Professional">Professional</option>
                <option value="Salaries">Salaries</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {(selectedCategory !== "All" || startDate || endDate) && (
              <button
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
                onClick={() => {
                  setSelectedCategory("All");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* SUMMARY */}
          {aggregatedData.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Summary</p>
              <div className="space-y-2">
                {aggregatedData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600 truncate max-w-[100px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">Total</span>
                  <span className="text-xs font-bold text-gray-800">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PIE CHART */}
        <div className="flex-1 bg-white shadow-sm rounded-2xl border border-gray-100 p-5 min-h-[460px]">
          {aggregatedData.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400">
              No expense data for the selected filters.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={300}>
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="45%"
                  outerRadius={150}
                  dataKey="amount"
                  nameKey="name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                >
                  {aggregatedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={index === activeIndex ? 1 : 0.75}
                      stroke={index === activeIndex ? entry.color : "none"}
                      strokeWidth={index === activeIndex ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Amount",
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;

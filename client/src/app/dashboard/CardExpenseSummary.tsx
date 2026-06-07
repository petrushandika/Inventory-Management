"use client";

import { ExpenseByCategorySummary, useGetDashboardMetricsQuery } from "@/state/api";
import { formatRupiah, formatRupiahShort } from "@/lib/currency";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ExpenseSums = { [category: string]: number };

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const CardExpenseSummary = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  const expenseSummary = dashboardMetrics?.expenseSummary[0];
  const expenseByCategorySummary = dashboardMetrics?.expenseByCategorySummary ?? [];

  const { expenseCategories, totalExpenses } = useMemo(() => {
    const sums = expenseByCategorySummary.reduce((acc: ExpenseSums, item: ExpenseByCategorySummary) => {
      acc[item.category] = (acc[item.category] ?? 0) + parseInt(item.amount, 10);
      return acc;
    }, {});
    const categories = Object.entries(sums).map(([name, value]) => ({ name, value }));
    const total = categories.reduce((acc, c) => acc + c.value, 0);
    return { expenseCategories: categories, totalExpenses: total };
  }, [expenseByCategorySummary]);

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col flex-1">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[180px]">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="shrink-0">
            <h2 className="text-base font-semibold px-6 pt-5 pb-3 text-gray-800">Expense Summary</h2>
            <hr className="border-gray-100" />
          </div>

          <div className="flex items-center gap-3 px-5 py-4">
            <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={expenseCategories} innerRadius={38} outerRadius={54} dataKey="value" nameKey="name" cx="50%" cy="50%" paddingAngle={2}>
                    {expenseCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                    formatter={(value: number) => [formatRupiah(value), "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                  {formatRupiahShort(totalExpenses)}
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 flex-1 min-w-0">
              {expenseCategories.map((entry, index) => (
                <li key={`legend-${index}`} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate">{entry.name}</span>
                  <span className="ml-auto font-medium text-gray-700 shrink-0">{formatRupiahShort(entry.value)}</span>
                </li>
              ))}
            </ul>
          </div>

          {expenseSummary && (
            <>
              <hr className="border-gray-100 mx-5" />
              <div className="flex justify-between items-center px-5 py-3 text-xs text-gray-500">
                <span>Total: <span className="font-semibold text-gray-700">{formatRupiah(expenseSummary.totalExpenses)}</span></span>
                <span className="flex items-center text-green-500 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  30%
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CardExpenseSummary;

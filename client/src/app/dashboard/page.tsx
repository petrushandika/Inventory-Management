"use client";

import { BarChart2, Package, ShoppingCart, Users } from "lucide-react";
import CardExpenseSummary from "./CardExpenseSummary";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";
import { useGetDashboardMetricsQuery } from "@/state/api";
import { formatRupiahShort } from "@/lib/currency";

const fmtCount = (n: number) => {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const s = data?.stats;

  const salesVsPurchaseChange =
    s && s.totalPurchaseCost > 0
      ? ((s.totalSalesAmount - s.totalPurchaseCost) / s.totalPurchaseCost) * 100
      : undefined;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Penjualan"
          icon={BarChart2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          details={[
            {
              label: "Total Pendapatan",
              value: isLoading ? "…" : formatRupiahShort(s?.totalSalesAmount ?? 0),
              change: salesVsPurchaseChange,
            },
            { label: "Transaksi", value: isLoading ? "…" : fmtCount(s?.totalSalesCount ?? 0) },
            { label: "30 Hari Terakhir", value: isLoading ? "…" : formatRupiahShort(s?.last30DaysSales ?? 0) },
          ]}
        />
        <StatCard
          title="Pembelian"
          icon={ShoppingCart}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          details={[
            { label: "Total Biaya", value: isLoading ? "…" : formatRupiahShort(s?.totalPurchaseCost ?? 0) },
            { label: "Transaksi", value: isLoading ? "…" : fmtCount(s?.totalPurchaseCount ?? 0) },
            { label: "30 Hari Terakhir", value: isLoading ? "…" : formatRupiahShort(s?.last30DaysPurchases ?? 0) },
          ]}
        />
        <StatCard
          title="Inventaris"
          icon={Package}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          details={[
            { label: "Total Produk", value: isLoading ? "…" : fmtCount(s?.productCount ?? 0) },
            { label: "Nilai Stok", value: isLoading ? "…" : formatRupiahShort(s?.totalStockValue ?? 0) },
            { label: "Stok Menipis", value: isLoading ? "…" : fmtCount(s?.lowStockCount ?? 0) },
          ]}
        />
        <StatCard
          title="Pengguna & Pengeluaran"
          icon={Users}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          details={[
            { label: "Total Pengguna", value: isLoading ? "…" : fmtCount(s?.userCount ?? 0) },
            { label: "Total Pengeluaran", value: isLoading ? "…" : formatRupiahShort(s?.totalExpenses ?? 0) },
            { label: "Catatan Pengeluaran", value: isLoading ? "…" : fmtCount(s?.totalExpenseCount ?? 0) },
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <CardPopularProducts />
        <CardSalesSummary />
        <div className="flex flex-col gap-4">
          <CardPurchaseSummary />
          <CardExpenseSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

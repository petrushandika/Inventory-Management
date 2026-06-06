"use client";

import {
  CheckCircle,
  Package,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import CardExpenseSummary from "./CardExpenseSummary";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Customer & Expenses"
          primaryIcon={<Package className="text-blue-600 w-6 h-6" />}
          dateRange="22 - 29 Oct 2025"
          details={[
            {
              title: "Customer Growth",
              amount: "175.00",
              changePercentage: 131,
              IconComponent: TrendingUp,
            },
            {
              title: "Expenses",
              amount: "10.00",
              changePercentage: -56,
              IconComponent: TrendingDown,
            },
          ]}
        />
        <StatCard
          title="Dues & Pending Orders"
          primaryIcon={<CheckCircle className="text-blue-600 w-6 h-6" />}
          dateRange="22 - 29 Oct 2025"
          details={[
            {
              title: "Dues",
              amount: "250.00",
              changePercentage: 131,
              IconComponent: TrendingUp,
            },
            {
              title: "Pending Orders",
              amount: "147",
              changePercentage: -56,
              IconComponent: TrendingDown,
            },
          ]}
        />
        <StatCard
          title="Sales & Discount"
          primaryIcon={<Tag className="text-blue-600 w-6 h-6" />}
          dateRange="22 - 29 Oct 2025"
          details={[
            {
              title: "Sales",
              amount: "1000.00",
              changePercentage: 20,
              IconComponent: TrendingUp,
            },
            {
              title: "Discount",
              amount: "200.00",
              changePercentage: -10,
              IconComponent: TrendingDown,
            },
          ]}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Column 1: Popular Products */}
        <CardPopularProducts />

        {/* Column 2: Sales Summary */}
        <CardSalesSummary />

        {/* Column 3: Purchase + Expense stacked */}
        <div className="flex flex-col gap-4">
          <CardPurchaseSummary />
          <CardExpenseSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

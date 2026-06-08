"use client";

import {
  useGetCategoriesQuery,
  useGetExpensesByCategoryQuery,
  useGetProductsQuery,
  useGetPurchaseOrdersQuery,
  useGetSuppliersQuery,
  useGetUsersQuery,
} from "@/state/api";
import Header from "@/app/(components)/Header";
import ExportReportMenu from "@/app/(components)/ExportReportMenu";
import {
  Archive,
  Clipboard,
  FileBarChart,
  ShoppingCart,
  Tag,
  Truck,
  User,
  AlertTriangle,
  CircleDollarSign,
} from "lucide-react";
import {
  buildCategoriesReport,
  buildExpensesReport,
  buildInventoryReport,
  buildLowStockReport,
  buildProductsReport,
  buildPurchaseOrdersReport,
  buildSuppliersReport,
  buildUsersReport,
} from "@/lib/reportData";
import type { ReportRow } from "@/lib/exportReport";
import type { LucideIcon } from "lucide-react";

type ReportCard = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  filename: string;
  reportTitle: string;
  data: ReportRow[];
  isLoading: boolean;
};

const ReportCardItem = ({ card }: { card: ReportCard }) => {
  const Icon = card.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-800">{card.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{card.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div>
          {card.isLoading ? (
            <span className="text-xs text-gray-400">Loading…</span>
          ) : (
            <span className="text-2xl font-bold text-gray-900">{card.data.length}</span>
          )}
          <p className="text-xs text-gray-400">records</p>
        </div>
        <ExportReportMenu
          data={card.data}
          filename={card.filename}
          title={card.reportTitle}
          disabled={card.isLoading || !card.data.length}
        />
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery(undefined);
  const { data: orders = [], isLoading: loadingOrders } = useGetPurchaseOrdersQuery(undefined);
  const { data: users = [], isLoading: loadingUsers } = useGetUsersQuery();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useGetSuppliersQuery(undefined);
  const { data: categories = [], isLoading: loadingCategories } = useGetCategoriesQuery(undefined);
  const { data: expenses = [], isLoading: loadingExpenses } = useGetExpensesByCategoryQuery();

  const reportCards: ReportCard[] = [
    {
      id: "products",
      title: "Products Report",
      description: "All products with stock status and pricing",
      icon: Clipboard,
      filename: "products",
      reportTitle: "Products Report",
      data: buildProductsReport(products),
      isLoading: loadingProducts,
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description: "Stock levels and availability status",
      icon: Archive,
      filename: "inventory",
      reportTitle: "Inventory Report",
      data: buildInventoryReport(products),
      isLoading: loadingProducts,
    },
    {
      id: "low-stock",
      title: "Low Stock Report",
      description: "Products with Low Stock or Out of Stock status",
      icon: AlertTriangle,
      filename: "low-stock",
      reportTitle: "Low Stock Report",
      data: buildLowStockReport(products),
      isLoading: loadingProducts,
    },
    {
      id: "purchases",
      title: "Purchase Orders Report",
      description: "All purchase orders with status and totals",
      icon: ShoppingCart,
      filename: "purchase-orders",
      reportTitle: "Purchase Orders Report",
      data: buildPurchaseOrdersReport(orders),
      isLoading: loadingOrders,
    },
    {
      id: "suppliers",
      title: "Suppliers Report",
      description: "Supplier contacts and purchase history",
      icon: Truck,
      filename: "suppliers",
      reportTitle: "Suppliers Report",
      data: buildSuppliersReport(suppliers),
      isLoading: loadingSuppliers,
    },
    {
      id: "categories",
      title: "Categories Report",
      description: "Product categories and item counts",
      icon: Tag,
      filename: "categories",
      reportTitle: "Categories Report",
      data: buildCategoriesReport(categories),
      isLoading: loadingCategories,
    },
    {
      id: "expenses",
      title: "Expenses Report",
      description: "Expense breakdown by category and date",
      icon: CircleDollarSign,
      filename: "expenses",
      reportTitle: "Expenses Report",
      data: buildExpensesReport(expenses),
      isLoading: loadingExpenses,
    },
    {
      id: "users",
      title: "Users Report",
      description: "System users with roles and registration dates",
      icon: User,
      filename: "users",
      reportTitle: "Users Report",
      data: buildUsersReport(users),
      isLoading: loadingUsers,
    },
  ];

  const totalRecords = reportCards.reduce((sum, c) => sum + c.data.length, 0);
  const isAnyLoading = reportCards.some((c) => c.isLoading);

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Header name="Reports" />
          <p className="text-sm text-gray-400 mt-0.5">
            Export data as CSV, Excel, PDF, or print directly
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
          <FileBarChart className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-400">Total records</p>
            <p className="text-sm font-semibold text-gray-800">
              {isAnyLoading ? "…" : totalRecords.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reportCards.map((card) => (
          <ReportCardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

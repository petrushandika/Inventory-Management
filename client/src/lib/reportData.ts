import { getStockStatus } from "./stockStatus";
import type {
  Category,
  ExpenseByCategorySummary,
  Product,
  PurchaseOrder,
  Supplier,
  User,
} from "@/state/api";
import type { ReportRow } from "./exportReport";

export function buildProductsReport(products: Product[]): ReportRow[] {
  return products.map((p) => ({
    name: p.name,
    price: p.price,
    stock: p.stockQuantity,
    minStock: p.minStock ?? 20,
    status: getStockStatus(p.stockQuantity, p.minStock ?? 20),
    rating: p.rating ?? "",
    categoryId: p.categoryId ?? "",
  }));
}

export function buildInventoryReport(products: Product[]): ReportRow[] {
  return products.map((p) => ({
    name: p.name,
    stock: p.stockQuantity,
    minStock: p.minStock ?? 20,
    status: getStockStatus(p.stockQuantity, p.minStock ?? 20),
    price: p.price,
  }));
}

export function buildLowStockReport(products: Product[]): ReportRow[] {
  return products
    .filter((p) => {
      const status = getStockStatus(p.stockQuantity, p.minStock ?? 20);
      return status === "Low Stock" || status === "Out of Stock";
    })
    .map((p) => ({
      name: p.name,
      stock: p.stockQuantity,
      minStock: p.minStock ?? 20,
      status: getStockStatus(p.stockQuantity, p.minStock ?? 20),
    }));
}

export function buildPurchaseOrdersReport(orders: PurchaseOrder[]): ReportRow[] {
  return orders.map((o) => ({
    orderId: o.orderId,
    supplier: o.supplier?.name ?? "",
    status: o.status,
    items: o.items.length,
    totalCost: o.totalCost,
    notes: o.notes ?? "",
    createdAt: new Date(o.createdAt).toLocaleDateString("en-US"),
  }));
}

export function buildUsersReport(users: User[]): ReportRow[] {
  return users.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: new Date(u.createdAt).toLocaleDateString("en-US"),
  }));
}

export function buildSuppliersReport(suppliers: Supplier[]): ReportRow[] {
  return suppliers.map((s) => ({
    name: s.name,
    email: s.email ?? "",
    phone: s.phone ?? "",
    address: s.address ?? "",
    purchases: s._count?.Purchases ?? 0,
  }));
}

export function buildCategoriesReport(categories: Category[]): ReportRow[] {
  return categories.map((c) => ({
    name: c.name,
    products: c._count?.Products ?? 0,
    color: c.color,
  }));
}

export function buildExpensesReport(expenses: ExpenseByCategorySummary[]): ReportRow[] {
  return expenses.map((e) => ({
    category: e.category,
    amount: parseInt(e.amount, 10),
    date: new Date(e.date).toISOString().split("T")[0],
  }));
}

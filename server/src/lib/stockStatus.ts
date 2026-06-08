export type StockStatus = "Active" | "Normal" | "Low Stock" | "Out of Stock";

/**
 * Rule 11 — Inventory status:
 * a. Active       : stock > (minStock + 5)
 * b. Out of Stock : stock < (minStock - 5)
 * c. Low Stock    : stock == minStock
 */
export function getStockStatus(stockQuantity: number, minStock: number): StockStatus {
  if (stockQuantity > minStock + 5) return "Active";
  if (stockQuantity < minStock - 5) return "Out of Stock";
  if (stockQuantity === minStock) return "Low Stock";
  return "Normal";
}

export function needsStockAlert(stockQuantity: number, minStock: number): boolean {
  const status = getStockStatus(stockQuantity, minStock);
  return status === "Low Stock" || status === "Out of Stock";
}

export function countLowStockProducts(
  products: { stockQuantity: number; minStock: number }[]
): number {
  return products.filter((p) => needsStockAlert(p.stockQuantity, p.minStock)).length;
}

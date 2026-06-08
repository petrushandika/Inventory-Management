export type StockStatus = "Available" | "Unavailable" | "Warning" | "Adequate";

/**
 * Rule 11 — Inventory status:
 * a. Available   : stock > (minStock + 5)
 * b. Unavailable : stock < (minStock - 5)
 * c. Warning     : stock == minStock
 */
export function getStockStatus(stockQuantity: number, minStock: number): StockStatus {
  if (stockQuantity > minStock + 5) return "Available";
  if (stockQuantity < minStock - 5) return "Unavailable";
  if (stockQuantity === minStock) return "Warning";
  return "Adequate";
}

export function needsStockAlert(stockQuantity: number, minStock: number): boolean {
  const status = getStockStatus(stockQuantity, minStock);
  return status === "Warning" || status === "Unavailable";
}

export function countLowStockProducts(
  products: { stockQuantity: number; minStock: number }[]
): number {
  return products.filter((p) => needsStockAlert(p.stockQuantity, p.minStock)).length;
}

export type StockStatus = "Tersedia" | "Tidak Tersedia" | "Warning" | "Cukup";

/**
 * Rule 11 — Status Persediaan:
 * a. Tersedia       : stok > (minStock + 5)
 * b. Tidak Tersedia : stok < (minStock - 5)
 * c. Warning        : stok == minStock
 */
export function getStockStatus(stockQuantity: number, minStock: number): StockStatus {
  if (stockQuantity > minStock + 5) return "Tersedia";
  if (stockQuantity < minStock - 5) return "Tidak Tersedia";
  if (stockQuantity === minStock) return "Warning";
  return "Cukup";
}

export function needsStockAlert(stockQuantity: number, minStock: number): boolean {
  const status = getStockStatus(stockQuantity, minStock);
  return status === "Warning" || status === "Tidak Tersedia";
}

export function countLowStockProducts(
  products: { stockQuantity: number; minStock: number }[]
): number {
  return products.filter((p) => needsStockAlert(p.stockQuantity, p.minStock)).length;
}

export type StockStatus = "Tersedia" | "Tidak Tersedia" | "Warning" | "Cukup";

export interface StockStatusInfo {
  status: StockStatus;
  label: string;
  className: string;
}

/**
 * Rule 11 — Status Persediaan:
 * a. Tersedia       : stok > (minStock + 5)
 * b. Tidak Tersedia : stok < (minStock - 5)
 * c. Warning        : stok == minStock
 * d. Cukup          : kondisi di antara (tidak masuk a/b/c)
 */
export function getStockStatus(stockQuantity: number, minStock: number): StockStatus {
  if (stockQuantity > minStock + 5) return "Tersedia";
  if (stockQuantity < minStock - 5) return "Tidak Tersedia";
  if (stockQuantity === minStock) return "Warning";
  return "Cukup";
}

export function getStockStatusInfo(stockQuantity: number, minStock: number): StockStatusInfo {
  const status = getStockStatus(stockQuantity, minStock);
  const map: Record<StockStatus, Omit<StockStatusInfo, "status">> = {
    Tersedia: {
      label: "Tersedia",
      className: "bg-green-50 text-green-700",
    },
    "Tidak Tersedia": {
      label: "Tidak Tersedia",
      className: "bg-red-50 text-red-700",
    },
    Warning: {
      label: "Warning",
      className: "bg-yellow-50 text-yellow-700",
    },
    Cukup: {
      label: "Cukup",
      className: "bg-blue-50 text-blue-700",
    },
  };
  return { status, ...map[status] };
}

/** Produk perlu perhatian: Warning atau Tidak Tersedia */
export function needsStockAlert(stockQuantity: number, minStock: number): boolean {
  const status = getStockStatus(stockQuantity, minStock);
  return status === "Warning" || status === "Tidak Tersedia";
}

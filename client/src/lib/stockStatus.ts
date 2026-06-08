export type StockStatus = "Available" | "Unavailable" | "Warning" | "Adequate";

export interface StockStatusInfo {
  status: StockStatus;
  label: string;
  className: string;
}

/**
 * Rule 11 — Inventory status:
 * a. Available   : stock > (minStock + 5)
 * b. Unavailable : stock < (minStock - 5)
 * c. Warning     : stock == minStock
 * d. Adequate    : in-between cases (not a/b/c)
 */
export function getStockStatus(stockQuantity: number, minStock: number): StockStatus {
  if (stockQuantity > minStock + 5) return "Available";
  if (stockQuantity < minStock - 5) return "Unavailable";
  if (stockQuantity === minStock) return "Warning";
  return "Adequate";
}

export function getStockStatusInfo(stockQuantity: number, minStock: number): StockStatusInfo {
  const status = getStockStatus(stockQuantity, minStock);
  const map: Record<StockStatus, Omit<StockStatusInfo, "status">> = {
    Available: {
      label: "Available",
      className: "bg-green-50 text-green-700",
    },
    Unavailable: {
      label: "Unavailable",
      className: "bg-red-50 text-red-700",
    },
    Warning: {
      label: "Warning",
      className: "bg-yellow-50 text-yellow-700",
    },
    Adequate: {
      label: "Adequate",
      className: "bg-blue-50 text-blue-700",
    },
  };
  return { status, ...map[status] };
}

/** Products needing attention: Warning or Unavailable */
export function needsStockAlert(stockQuantity: number, minStock: number): boolean {
  const status = getStockStatus(stockQuantity, minStock);
  return status === "Warning" || status === "Unavailable";
}

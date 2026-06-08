export type StockStatus = "Active" | "Normal" | "Low Stock" | "Out of Stock";

export interface StockStatusInfo {
  status: StockStatus;
  label: string;
  className: string;
}

/**
 * Rule 11 — Inventory status:
 * a. Active       : stock > (minStock + 5)
 * b. Out of Stock : stock < (minStock - 5)
 * c. Low Stock    : stock == minStock
 * d. Normal       : in-between cases (not a/b/c)
 */
export function getStockStatus(stockQuantity: number, minStock: number): StockStatus {
  if (stockQuantity > minStock + 5) return "Active";
  if (stockQuantity < minStock - 5) return "Out of Stock";
  if (stockQuantity === minStock) return "Low Stock";
  return "Normal";
}

export function getStockStatusInfo(stockQuantity: number, minStock: number): StockStatusInfo {
  const status = getStockStatus(stockQuantity, minStock);
  const map: Record<StockStatus, Omit<StockStatusInfo, "status">> = {
    Active: {
      label: "Active",
      className: "bg-green-50 text-green-700",
    },
    "Out of Stock": {
      label: "Out of Stock",
      className: "bg-red-50 text-red-700",
    },
    "Low Stock": {
      label: "Low Stock",
      className: "bg-amber-50 text-amber-700",
    },
    Normal: {
      label: "Normal",
      className: "bg-blue-50 text-blue-700",
    },
  };
  return { status, ...map[status] };
}

/** Products needing attention: Low Stock or Out of Stock */
export function needsStockAlert(stockQuantity: number, minStock: number): boolean {
  const status = getStockStatus(stockQuantity, minStock);
  return status === "Low Stock" || status === "Out of Stock";
}

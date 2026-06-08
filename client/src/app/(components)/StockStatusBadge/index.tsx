import { getStockStatusInfo } from "@/lib/stockStatus";

interface StockStatusBadgeProps {
  stockQuantity: number;
  minStock: number;
  showQuantity?: boolean;
}

const StockStatusBadge = ({ stockQuantity, minStock, showQuantity = false }: StockStatusBadgeProps) => {
  const { label, className } = getStockStatusInfo(stockQuantity, minStock);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {showQuantity && <span>{stockQuantity.toLocaleString("en-US")}</span>}
      <span>{label}</span>
    </span>
  );
};

export default StockStatusBadge;

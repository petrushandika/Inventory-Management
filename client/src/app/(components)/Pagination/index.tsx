import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
};

const Pagination = ({ page, pageSize, total, pageSizeOptions = [10, 20, 50, 100], onPageChange, onPageSizeChange }: Props) => {
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
      {/* Left: rows per page */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-500">Rows per page:</span>
        <select
          value={pageSize === 0 ? "all" : pageSize}
          onChange={(e) => { onPageSizeChange(e.target.value === "all" ? 0 : Number(e.target.value)); onPageChange(1); }}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
        >
          {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="all">All</option>
        </select>
      </div>

      {/* Right: page info + arrows */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-500">
          {total === 0 ? "0–0 of 0" : pageSize === 0 ? `1–${total} of ${total}` : `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total}`}
        </span>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

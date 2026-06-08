"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { exportReport, ReportFormat, ReportRow } from "@/lib/exportReport";

interface ExportReportMenuProps {
  data: ReportRow[];
  filename: string;
  title?: string;
  disabled?: boolean;
}

const OPTIONS: { format: ReportFormat; label: string; icon: typeof Download }[] = [
  { format: "csv", label: "Export CSV", icon: Download },
  { format: "excel", label: "Export Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "Export PDF", icon: FileText },
  { format: "print", label: "Print", icon: Printer },
];

const ExportReportMenu = ({ data, filename, title, disabled }: ExportReportMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleExport = (format: ReportFormat) => {
    exportReport(format, data, filename, title);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled || !data.length}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export Report</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1">
          {OPTIONS.map(({ format, label, icon: Icon }) => (
            <button
              key={format}
              type="button"
              onClick={() => handleExport(format)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-4 h-4 text-gray-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportReportMenu;

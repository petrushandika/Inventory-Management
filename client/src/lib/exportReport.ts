import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { exportCsv } from "./exportCsv";

export type ReportRow = Record<string, string | number | boolean | null | undefined>;

function normalizeRows(data: ReportRow[]): { headers: string[]; rows: string[][] } {
  if (!data.length) return { headers: [], rows: [] };
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      return String(val);
    })
  );
  return { headers, rows };
}

/** Rule 12 — Export laporan ke CSV */
export function exportReportCsv(data: ReportRow[], filename: string): void {
  exportCsv(data, filename);
}

/** Rule 12 — Export laporan ke Excel (.xlsx) */
export function exportReportExcel(data: ReportRow[], filename: string): void {
  if (!data.length) return;
  const { headers, rows } = normalizeRows(data);
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Laporan");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/** Rule 12 — Export laporan ke PDF */
export function exportReportPdf(
  data: ReportRow[],
  filename: string,
  title = "Laporan"
): void {
  if (!data.length) return;
  const { headers, rows } = normalizeRows(data);
  const doc = new jsPDF({ orientation: rows.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 22);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${filename}.pdf`);
}

/** Rule 12 — Cetak laporan langsung ke printer */
export function printReport(data: ReportRow[], title = "Laporan"): void {
  if (!data.length) return;
  const { headers, rows } = normalizeRows(data);

  const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
  const tableBody = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  p { font-size: 12px; color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #2563eb; color: #fff; }
  tr:nth-child(even) { background: #f9fafb; }
</style></head><body>
  <h1>${title}</h1>
  <p>Dicetak: ${new Date().toLocaleString("id-ID")}</p>
  <table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export type ReportFormat = "csv" | "excel" | "pdf" | "print";

export function exportReport(
  format: ReportFormat,
  data: ReportRow[],
  filename: string,
  title?: string
): void {
  switch (format) {
    case "csv":
      exportReportCsv(data, filename);
      break;
    case "excel":
      exportReportExcel(data, filename);
      break;
    case "pdf":
      exportReportPdf(data, filename, title);
      break;
    case "print":
      printReport(data, title);
      break;
  }
}

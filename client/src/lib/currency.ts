/**
 * Format a number as Indonesian Rupiah.
 * Examples:
 *   1234567  → "Rp 1.234.567"
 *   1500000  → "Rp 1,5 jt"    (compact)
 *   2000000000 → "Rp 2 M"     (compact)
 */

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/** Compact form: 1.5jt, 2M, etc. */
export const formatRupiahCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  }
  return formatRupiah(value);
};

/** Short label for stat cards: Rp 528 jt, Rp 2 M */
export const formatRupiahShort = (value: number): string => {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} T`;
  }
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  }
  return formatRupiah(value);
};

/**
 * Format a number as Indonesian Rupiah with English locale formatting.
 * Examples:
 *   1234567  → "Rp 1,234,567"
 *   1500000  → "Rp 1.5M"    (compact)
 *   2000000000 → "Rp 2B"    (compact)
 */

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/** Compact form: 1.5M, 2B, etc. */
export const formatRupiahCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}B`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}K`;
  }
  return formatRupiah(value);
};

/** Short label for stat cards */
export const formatRupiahShort = (value: number): string => {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}T`;
  }
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}B`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}K`;
  }
  return formatRupiah(value);
};

import { useState, useMemo } from "react";

export type SortDir = "asc" | "desc" | null;
export type SortState<K extends string> = { key: K | null; dir: SortDir };

export function useSort<T, K extends string>(
  data: T[] | undefined,
  getValue: (item: T, key: K) => string | number | undefined
) {
  const [sort, setSort] = useState<SortState<K>>({ key: null, dir: null });

  const toggle = (key: K) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const sorted = useMemo(() => {
    if (!data || !sort.key || !sort.dir) return data ?? [];
    const key = sort.key;
    const dir = sort.dir;
    return [...data].sort((a, b) => {
      const av = getValue(a, key) ?? "";
      const bv = getValue(b, key) ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return dir === "asc" ? av - bv : bv - av;
      }
      return dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sort, getValue]);

  return { sorted, sort, toggle };
}

"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { useGetProductsQuery, useGetUsersQuery } from "@/state/api";
import { needsStockAlert } from "@/lib/stockStatus";
import { AlertTriangle, Bell, Menu, Moon, Search, Settings, Sun, X } from "lucide-react";
import RemoteImage from "@/app/(components)/RemoteImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const toggleDarkMode = () => dispatch(setIsDarkMode(!isDarkMode));

  const { data: users, isLoading, isError } = useGetUsersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const lowStockProducts = products.filter((p) =>
    needsStockAlert(p.stockQuantity, p.minStock ?? 20)
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const user = users?.[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="flex justify-between items-center w-full gap-3">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors shrink-0"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products..."
            className="pl-9 pr-4 py-2 w-44 md:w-64 lg:w-72 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />
        </form>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="text-gray-500" size={18} /> : <Moon className="text-gray-500" size={18} />}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="text-gray-500" size={18} />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Low Stock Alerts</span>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">All products are well-stocked.</p>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {lowStockProducts.map((p) => (
                    <li key={p.productId}>
                      <Link
                        href={`/products/${p.productId}/edit`}
                        onClick={() => setShowNotifications(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-red-500">{p.stockQuantity} units left</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="px-4 py-2 border-t border-gray-100">
                <Link
                  href="/inventory"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View all inventory →
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:flex" aria-label="Settings">
          <Settings className="text-gray-500" size={18} />
        </Link>

        <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

        <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
            {isLoading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            ) : user?.image ? (
              <RemoteImage src={user.image} width={32} height={32} alt={user.name} className="object-cover w-full h-full" fallbackClassName="w-full h-full text-xs" />
            ) : (
              <span className="text-xs font-bold text-blue-600">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {isLoading ? "..." : isError || !user ? "Guest" : user.name}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {isLoading ? "" : user?.email ?? ""}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

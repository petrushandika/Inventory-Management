"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { useGetUsersQuery } from "@/state/api";
import { Bell, Menu, Moon, Search, Settings, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const toggleDarkMode = () => dispatch(setIsDarkMode(!isDarkMode));

  const { data: users, isLoading, isError } = useGetUsersQuery();
  const user = users?.[0];

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
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="search"
            placeholder="Search products & categories..."
            className="pl-9 pr-4 py-2 w-44 md:w-64 lg:w-72 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />
        </div>
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

        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="text-gray-500" size={18} />
          </button>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
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
              <Image src={user.image} width={32} height={32} alt={user.name} className="object-cover w-full h-full" />
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

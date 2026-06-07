"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { api } from "@/state/api";
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LogOut,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  Tag,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center gap-3 transition-colors ${
          isCollapsed ? "justify-center py-3.5 px-3" : "justify-start px-6 py-3.5"
        } ${
          isActive
            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : ""}`} />
        {!isCollapsed && (
          <span className={`text-sm font-medium ${isActive ? "text-blue-600" : ""}`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const closeSidebar = () => dispatch(setIsSidebarCollapsed(true));

  const handleLogout = () => {
    // Reset all RTK Query cache and Redux persisted state
    dispatch(api.util.resetApiState());
    dispatch(setIsDarkMode(false));
    dispatch(setIsSidebarCollapsed(false));
    router.push("/login");
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-sm border-r border-gray-100 z-40`;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={sidebarClassNames}>
        {/* Top Logo */}
        <div
          className={`flex items-center justify-between py-5 border-b border-gray-100 shrink-0 ${
            isSidebarCollapsed ? "px-3" : "px-6"
          }`}
        >
          <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? "justify-center w-full" : ""}`}>
            <Image
              src="https://res.cloudinary.com/dqcyabvc2/image/upload/v1749802554/logo_w7rgwe.png"
              width={28}
              height={28}
              alt="Logo"
              className="shrink-0"
            />
            {!isSidebarCollapsed && (
              <h1 className="font-bold text-xl text-gray-800">XStock</h1>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={closeSidebar}
            >
              <Menu className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <SidebarLink href="/dashboard"  icon={Layout}           label="Dashboard"  isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/inventory"  icon={Archive}          label="Inventory"  isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/products"   icon={Clipboard}        label="Products"   isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/users"      icon={User}             label="Users"      isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/categories" icon={Tag}              label="Categories" isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/suppliers"  icon={Truck}            label="Suppliers"  isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/expenses"   icon={CircleDollarSign} label="Expenses"   isCollapsed={isSidebarCollapsed} />
          <SidebarLink href="/settings"   icon={SlidersHorizontal}label="Settings"   isCollapsed={isSidebarCollapsed} />
        </nav>

        {/* Footer — Logout */}
        <div className={`shrink-0 border-t border-gray-100 ${isSidebarCollapsed ? "p-3" : "p-4"}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isSidebarCollapsed ? "justify-center py-3 px-2" : "px-3 py-3"
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
          {!isSidebarCollapsed && (
            <p className="text-xs text-gray-400 mt-3 px-3">&copy; {new Date().getFullYear()} XStock. All rights reserved.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

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
  const isSiderbarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSiderbarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSiderbarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-sm border-r border-gray-100 z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* Top Logo */}
      <div
        className={`flex items-center justify-between py-5 border-b border-gray-100 ${
          isSiderbarCollapsed ? "px-3" : "px-6"
        }`}
      >
        <div className={`flex items-center gap-2.5 ${isSiderbarCollapsed ? "justify-center w-full" : ""}`}>
          <Image
            src="https://res.cloudinary.com/dqcyabvc2/image/upload/v1749802554/logo_w7rgwe.png"
            width={28}
            height={28}
            alt="Logo"
            className="shrink-0"
          />
          {!isSiderbarCollapsed && (
            <h1 className="font-bold text-xl text-gray-800">XStock</h1>
          )}
        </div>
        {!isSiderbarCollapsed && (
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleSidebar}
          >
            <Menu className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSiderbarCollapsed}
        />
        <SidebarLink
          href="/inventory"
          icon={Archive}
          label="Inventory"
          isCollapsed={isSiderbarCollapsed}
        />
        <SidebarLink
          href="/products"
          icon={Clipboard}
          label="Products"
          isCollapsed={isSiderbarCollapsed}
        />
        <SidebarLink
          href="/users"
          icon={User}
          label="Users"
          isCollapsed={isSiderbarCollapsed}
        />
        <SidebarLink
          href="/expenses"
          icon={CircleDollarSign}
          label="Expenses"
          isCollapsed={isSiderbarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSiderbarCollapsed}
        />
      </nav>

      {/* Footer */}
      {!isSiderbarCollapsed && (
        <div className="pb-6 px-6 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">&copy; 2025 XStock</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

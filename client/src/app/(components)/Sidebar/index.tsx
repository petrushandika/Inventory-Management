"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { api } from "@/state/api";
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  FileBarChart,
  Layout,
  LogOut,
  LucideIcon,
  Menu,
  ShoppingCart,
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
  const isActive =
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center gap-3 transition-colors ${
          isCollapsed ? "justify-center py-3 px-3" : "justify-start px-4 py-2.5 mx-2 rounded-lg"
        } ${
          isActive
            ? isCollapsed
              ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
              : "bg-blue-50 text-blue-600"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`}
      >
        <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-blue-600" : ""}`} />
        {!isCollapsed && (
          <span className={`text-sm font-medium truncate ${isActive ? "text-blue-600" : ""}`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

interface SidebarSectionProps {
  title: string;
  isCollapsed: boolean;
  children: React.ReactNode;
}

const SidebarSection = ({ title, isCollapsed, children }: SidebarSectionProps) => (
  <div className="mb-1">
    {!isCollapsed && (
      <p className="px-6 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
    )}
    {isCollapsed && <div className="h-2" />}
    {children}
  </div>
);

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const closeSidebar = () => dispatch(setIsSidebarCollapsed(true));

  const handleLogout = () => {
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
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={sidebarClassNames}>
        {/* Logo */}
        <div
          className={`flex items-center justify-between py-4 border-b border-gray-100 shrink-0 ${
            isSidebarCollapsed ? "px-3" : "px-5"
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
              <h1 className="font-bold text-lg text-gray-800">XStock</h1>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <Menu className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation — ordered by setup workflow (fill top → bottom) */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          <SidebarSection title="Overview" isCollapsed={isSidebarCollapsed}>
            <SidebarLink href="/dashboard" icon={Layout} label="Dashboard" isCollapsed={isSidebarCollapsed} />
          </SidebarSection>

          <SidebarSection title="Master Data" isCollapsed={isSidebarCollapsed}>
            <SidebarLink href="/categories" icon={Tag} label="Categories" isCollapsed={isSidebarCollapsed} />
            <SidebarLink href="/suppliers" icon={Truck} label="Suppliers" isCollapsed={isSidebarCollapsed} />
            <SidebarLink href="/products" icon={Clipboard} label="Products" isCollapsed={isSidebarCollapsed} />
          </SidebarSection>

          <SidebarSection title="Stock" isCollapsed={isSidebarCollapsed}>
            <SidebarLink href="/inventory" icon={Archive} label="Inventory" isCollapsed={isSidebarCollapsed} />
          </SidebarSection>

          <SidebarSection title="Operations" isCollapsed={isSidebarCollapsed}>
            <SidebarLink href="/purchases" icon={ShoppingCart} label="Purchases" isCollapsed={isSidebarCollapsed} />
            <SidebarLink href="/expenses" icon={CircleDollarSign} label="Expenses" isCollapsed={isSidebarCollapsed} />
          </SidebarSection>

          <SidebarSection title="Reports" isCollapsed={isSidebarCollapsed}>
            <SidebarLink href="/reports" icon={FileBarChart} label="Reports" isCollapsed={isSidebarCollapsed} />
          </SidebarSection>

          <SidebarSection title="Administration" isCollapsed={isSidebarCollapsed}>
            <SidebarLink href="/users" icon={User} label="Users" isCollapsed={isSidebarCollapsed} />
            <SidebarLink href="/settings" icon={SlidersHorizontal} label="Settings" isCollapsed={isSidebarCollapsed} />
          </SidebarSection>
        </nav>

        {/* Footer */}
        <div className={`shrink-0 border-t border-gray-100 ${isSidebarCollapsed ? "p-3" : "p-4"}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isSidebarCollapsed ? "justify-center py-3 px-2" : "px-3 py-2.5"
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
          {!isSidebarCollapsed && (
            <p className="text-[10px] text-gray-400 mt-3 px-3 text-center">
              &copy; {new Date().getFullYear()} XStock
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

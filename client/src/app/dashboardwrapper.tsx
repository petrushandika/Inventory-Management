"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";
import { usePathname } from "next/navigation";

const NO_SHELL_ROUTES = ["/login"];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  // Prevent body scroll only when mobile sidebar is open (not on md+ screens)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isSidebarCollapsed && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarCollapsed]);

  // Render without shell for auth pages
  if (NO_SHELL_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-gray-50 text-gray-900 w-full min-h-screen">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Sticky Navbar */}
        <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-100 px-4 sm:px-6 md:px-8 py-3.5">
          <Navbar />
        </div>
        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-5 md:py-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;

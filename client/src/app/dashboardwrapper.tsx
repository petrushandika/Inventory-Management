"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
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

  return (
    <div className="flex bg-gray-50 text-gray-900 w-full min-h-screen">
      <Sidebar />
      <main
        className={`flex flex-col w-full min-h-screen py-6 px-5 md:px-8 bg-gray-50 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-72"
        }`}
      >
        <Navbar />
        <div className="flex-1">{children}</div>
      </main>
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

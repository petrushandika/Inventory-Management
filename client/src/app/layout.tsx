import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Dashboardwrapper from "./dashboardwrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XStock — Inventory Management",
  description: "Manage your inventory, products, users, and expenses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Dashboardwrapper>{children}</Dashboardwrapper>
      </body>
    </html>
  );
}

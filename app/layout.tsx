import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { Toaster } from "@/components/ui/toaster";
// import { Button } from "@/components/ui/button"
// import { Bell } from "lucide-react"
import { Sidebar } from "@/components/sidebar";
import Header from "@/components/header";
import AppProvider from "@/provider/AppProvider";
import AuthProvider from "@/provider/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lawbie - Admin Dashboard",
  description: "Ecommerce Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <AuthProvider>
            <Header />
            <div className="flex">
              <Sidebar />

              <div className="w-full mt-[60px] bg-[#EDEEF1]">{children}</div>
            </div>

            {/* <Toaster /> */}
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}

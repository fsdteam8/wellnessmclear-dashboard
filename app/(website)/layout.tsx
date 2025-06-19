import type React from "react";
import type { Metadata } from "next";
import "../globals.css";
// import { Toaster } from "@/components/ui/toaster";
// import { Button } from "@/components/ui/button"
// import { Bell } from "lucide-react"
import { Sidebar } from "@/components/sidebar";
import Header from "@/components/header";
import AppProvider from "@/provider/AppProvider";
import AuthProvider from "@/provider/AuthProvider";

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
  );
}

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
import ProtectedRoute from "@/components/ProtectedRoute";

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
    <AuthProvider>
      <ProtectedRoute>
      <AppProvider>
        <Header />
        <div className="flex">
          <Sidebar />

          <div className="w-full mt-[60px] bg-[#EDEEF1]">{children}</div>
        </div>

        {/* <Toaster /> */}
      </AppProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

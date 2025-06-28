import type React from "react";
import type { Metadata } from "next";
import "../globals.css";


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
   <>{children}</>
  );
}

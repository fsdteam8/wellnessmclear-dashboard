"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import {  useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner"
interface Props {
  children: ReactNode;
}

const AppProvider = ({ children }: Props) => {
const { data, status } = useSession() as { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" };
console.log(data?.user?.role)

  const router = useRouter()
  if(status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (status !== "authenticated" && data?.user?.role !== "ADMIN") {
  router.push("/login");
  }
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}
    
    <Toaster position="top-right" />
    
    </QueryClientProvider>
  );
};

export default AppProvider;

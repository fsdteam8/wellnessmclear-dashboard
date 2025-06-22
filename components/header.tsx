'use client'
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
// import Image from 'next/image'
export default function Header() {
  const session = useSession();
  const user = session?.data?.user
  console.log('user', user);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 bg-[#525773] shadow-md">
      <div className="flex items-center space-x-2"></div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-white text-sm">
          <span>{user?.email}</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="text-black">
              {(user?.email?.slice(0, 2) || "").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
 
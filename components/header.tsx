import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import Image from 'next/image'
export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 bg-[#525773] shadow-md">
      <div className="flex items-center space-x-2"></div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-white text-sm">
          <span>Mr. Raja</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

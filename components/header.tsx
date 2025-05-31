import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
export default function Header() {
  return (
    <div className="flex h-16 items-center justify-between px-6 bg-slate-600">
    <div className="flex items-center space-x-2">
      <div className="text-2xl font-bold text-white">
        <span className="text-blue-400">Law</span>
        <span className="text-yellow-400">bie</span>
      </div>
    </div>
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
  )
}

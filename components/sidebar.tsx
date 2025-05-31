"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Tag,
  Ticket,
  List,
  MessageSquare,
  TrendingUp,
  DollarSign,
  FileText,
  User,
  Settings,
  LogOut,
  // Bell,
} from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Promo Code", href: "/promo-code", icon: Ticket },
  { name: "Resource List", href: "/resource-list", icon: List },
  { name: "Request Resource", href: "/request-resource", icon: FileText },
  { name: "Message", href: "/message", icon: MessageSquare },
  { name: "My Sales", href: "/my-sales", icon: TrendingUp },
  { name: "Revenue from Seller", href: "/revenue-from-seller", icon: DollarSign },
  { name: "Blog Management", href: "/blog-management", icon: FileText },
  { name: "Seller Profile", href: "/seller-profile", icon: User },
  { name: "User Profile", href: "/user-profile", icon: User },
  { name: "Setting", href: "/setting", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-700">
      {/* Header */}
     

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-yellow-500 text-slate-900" : "text-slate-300 hover:bg-slate-600 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <Link
          href="/logout"
          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </Link>
      </div>
    </div>
  )
}

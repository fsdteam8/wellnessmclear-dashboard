"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tag,
  FileText,
 
  LogOut,
  Settings,
  // Bell,
} from "lucide-react";
import { Ri24HoursLine } from "react-icons/ri";
import { BiCategoryAlt } from "react-icons/bi";
import Image from "next/image";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Category", href: "/category", icon: BiCategoryAlt },
  { name: "Products", href: "/products", icon: Tag },
  { name: "Blog Management", href: "/blog-management", icon: FileText },
  { name: "Services", href: "/services", icon: Ri24HoursLine },
  // { name: "Promo Code", href: "/promo-code", icon: Ticket },
  
  // { name: "Request Resource", href: "/request-resource", icon: FileText },
  // { name: "Message", href: "/message", icon: MessageSquare },
  // { name: "My Sales", href: "/my-sales", icon: TrendingUp },
  // {
  //   name: "Revenue from Seller",
  //   href: "/revenue-from-seller",
  //   icon: DollarSign,
  // },
  
  // { name: "Seller Profile", href: "/seller-profile", icon: User },
  // { name: "User Profile", href: "/user-profile", icon: User },
  // { name: "NewsLetter", href: "/news-letter", icon: Mails },
  { name: "Setting", href: "/setting", icon: Settings},
  // { name: "Reply To Question", href: "/reply-to-question", icon: Reply },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen sticky bottom-0 top-0 w-[350px] flex-col bg-[#2F3E34] z-50">
      <div className="h-[50px] px-4 py-3">
        <Image
          src="/images/wmcImage.svg"
          alt="Logo"
          width={100}
          height={80}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 px-3 lg:py-10 overflow-hidden">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-yellow-400 hover:bg-slate-600 hover:text-white"
                  : "text-slate-300 hover:bg-slate-600 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <p className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600 hover:text-white">
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </p>
      </div>
    </div>
  );
}

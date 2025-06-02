"use client"

import { useState } from "react"
// import { Breadcrumb } from "@/components/breadcrumb"
import { DataTable } from "@/components/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Seller {
  id: number
  sellerId: string  
  name: string
  avatar: string
  products: number
}

const mockSellers : Seller[] = [
  {
    id: 1,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
  {
    id: 2,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
  {
    id: 3,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
  {
    id: 4,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
  {
    id: 5,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
  {
    id: 6,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
  {
    id: 7,
    sellerId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    products: 200,
  },
]

const columns = [
  { key: "sellerId", label: "Seller ID" },
  {
    key: "name",
    label: "Seller Name",
    render: (value: string, row: Seller ) => (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.avatar || "/placeholder.svg"} />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
        <span>{value}</span>
      </div>
    ),
  },
  { key: "products", label: "Seller Product" },
  {
    key: "action",
    label: "Action",
    render: () => (
      <Button variant="outline" size="sm" className="bg-slate-600 text-white hover:bg-slate-700">
        Details
      </Button>
    ),
  },
]

export default function SellerProfilePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const totalItems = mockSellers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex h-screen bg-gray-50">
     

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              {/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Seller Profile" }]} /> */}
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">Seller Profile</h1>
                <p className="text-gray-500">Dashboard &gt; Seller Profile</p>
              </div>
            </div>
            <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
              <CardContent className="p-4">
                <div className="space-y-3">
                <p className="text-base opacity-90 ml-2">Total Sales</p>

                <div className="flex items-center space-x-2">
                  <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
                  <p className="text-[16px] font-bold">
                    $132,570.00
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            columns={columns}
            data={mockSellers}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

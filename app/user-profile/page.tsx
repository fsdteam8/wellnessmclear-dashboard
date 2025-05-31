"use client"

import { useState } from "react"
import { Breadcrumb } from "@/components/breadcrumb"
import { DataTable } from "@/components/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/type/types"

const mockUsers = [
  {
    id: 1,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
  {
    id: 2,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
  {
    id: 3,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
  {
    id: 4,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
  {
    id: 5,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
  {
    id: 6,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
  {
    id: 7,
    userId: "2201",
    name: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    totalOrder: 200,
    deliveredOrder: 170,
    pendingOrder: 20,
    cancelOrder: 10,
  },
]

const columns = [
  { key: "userId", label: "User ID" },
  {
    key: "name",
    label: "User Name",
    render: (value: string, row: User) => (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.avatar || "/placeholder.svg"} />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
        <span>{value}</span>
      </div>
    ),
  },
  { key: "totalOrder", label: "Total Order" },
  { key: "deliveredOrder", label: "Delivered Order" },
  { key: "pendingOrder", label: "Pending Order" },
  { key: "cancelOrder", label: "Cancel Order" },
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

export default function UserProfilePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const totalItems = mockUsers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "User Profile" }]} />
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">User Profile</h1>
                <p className="text-gray-500">Dashboard &gt; User Profile</p>
              </div>
            </div>
            <Card className="bg-slate-600 text-white">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm opacity-90">Total User</p>
                  <p className="text-xl font-bold">41,200.00</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            columns={columns}
            data={mockUsers}
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

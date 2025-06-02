"use client"

import { useState } from "react"
// import { Breadcrumb } from "@/components/breadcrumb"
import { DataTable } from "@/components/data-table"

const mockRevenueData = [
  { id: 1, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 2, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 3, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 4, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 5, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 6, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 7, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 8, sellerId: "4", productId: "45550", revenue: "$420" },
  { id: 9, sellerId: "4", productId: "45550", revenue: "$420" },
]

const columns = [
  { key: "sellerId", label: "Seller ID" },
  { key: "productId", label: "Product ID" },
  { key: "revenue", label: "Revenue from Seller" },
]

export default function RevenueFromSellerPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const totalItems = mockRevenueData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Revenue from Seller" }]} /> */}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Revenue from Seller</h1>
            <p className="text-gray-500">Dashboard &gt; Revenue from Seller</p>
          </div>

          <DataTable
            columns={columns}
            data={mockRevenueData}
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

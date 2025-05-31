"use client"

import { useState } from "react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Download } from "lucide-react"

const mockSalesData = [
  { id: 1, productId: "45550", quantity: 4, amount: "$30" },
  { id: 2, productId: "45550", quantity: 5, amount: "$300" },
  { id: 3, productId: "45550", quantity: 2, amount: "$300" },
  { id: 4, productId: "45550", quantity: 6, amount: "$300" },
  { id: 5, productId: "45550", quantity: 1, amount: "$300" },
  { id: 6, productId: "45550", quantity: 2, amount: "$300" },
]

const columns = [
  { key: "productId", label: "Product ID" },
  { key: "quantity", label: "Quantity" },
  { key: "amount", label: "Amount" },
]

export default function MySalesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [productIdFilter, setProductIdFilter] = useState("")
  const itemsPerPage = 6
  const totalItems = mockSalesData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleReset = () => {
    setProductIdFilter("")
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "wallet" }]} />
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">My Sales</h1>
                <p className="text-gray-500">Dashboard &gt; wallet</p>
              </div>
            </div>
            <Button className="bg-slate-600 hover:bg-slate-700">
              <Download className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {/* Total Sales Card */}
          <Card className="mb-8 bg-slate-600 text-white">
            <CardContent className="p-6">
              <div>
                <p className="text-sm opacity-90">Total Sales</p>
                <p className="text-2xl font-bold">$132,570.00</p>
              </div>
            </CardContent>
          </Card>

          {/* Sales History */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Sales History</h2>

            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Enter Product ID"
                value={productIdFilter}
                onChange={(e) => setProductIdFilter(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={mockSalesData}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

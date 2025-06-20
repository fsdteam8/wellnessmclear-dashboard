"use client"

import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Download, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface SalesData {
  quantity: number
  amount: number
  productId: string
}

interface ApiResponse {
  status: boolean
  message: string
  data: SalesData[]
}

const columns = [
  { key: "productId", label: "Product ID" },
  { key: "quantity", label: "Quantity" },
  { key: "amount", label: "Amount" },
]

export default function MySalesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [productIdFilter, setProductIdFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 6

  const { data: session } = useSession()
  const TOKEN = session?.accessToken || ""

  // Fetch function for all sales
  const fetchSalesData = async (): Promise<ApiResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard/my-sales`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch sales data")
    }
    return response.json()
  }

  // Fetch function for search by ID
  const fetchSalesDataBySearch = async (searchId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard/my-sales?search=${encodeURIComponent(searchId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error("Failed to fetch sales data")
    }
    return response.json()
  }

  const {
    data: allSalesData,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: ["sales-data"],
    queryFn: fetchSalesData,
    enabled: !searchTerm,
  })

  const {
    data: searchSalesData,
    isLoading: isLoadingSearch,
    error: errorSearch,
  } = useQuery({
    queryKey: ["sales-data-search", searchTerm],
    queryFn: () => fetchSalesDataBySearch(searchTerm),
    enabled: !!searchTerm,
  })

  const currentData = searchTerm ? searchSalesData : allSalesData
  const isLoading = searchTerm ? isLoadingSearch : isLoadingAll
  const error = searchTerm ? errorSearch : errorAll

  const formattedData =
    currentData?.data?.map((item, index) => ({
      id: index + 1,
      productId: item.productId,
      quantity: item.quantity,
      amount: `$${item.amount.toFixed(2)}`,
    })) || []

  const totalSales = currentData?.data?.reduce((sum, item) => sum + item.amount, 0) || 0

  const totalItems = formattedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleSearch = () => {
    if (productIdFilter.trim()) {
      setSearchTerm(productIdFilter.trim())
      setCurrentPage(1)
    }
  }

  const handleReset = () => {
    setProductIdFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#EDEEF1] items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-red-600">Error loading sales data: {error.message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#EDEEF1]">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">My Sales</h1>
                <p className="text-gray-500">Dashboard &gt; wallet</p>
              </div>
            </div>
            <Button className="bg-[#525773] hover:bg-[#272e52]">
              <Download className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {/* Total Sales Card */}
          <Card className="mb-8 bg-[#525773] text-white w-[470px] rounded-[8px]">
            <CardContent className="p-8">
              <div className="space-y-3">
                <p className="text-base opacity-90 ml-2">Total Sales</p>
                <div className="flex items-center space-x-2">
                  <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-[16px] font-bold">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-[16px] font-bold">${totalSales.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales History */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Sales History</h2>

            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Enter Product ID"
                value={productIdFilter}
                onChange={(e) => setProductIdFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                className="max-w-xs border border-[#707070] rounded-md"
              />
              <Button onClick={handleSearch} disabled={!productIdFilter.trim() || isLoading} variant="outline">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Search
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={isLoading}>
                Reset
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading sales data...</span>
              </div>
            ) : formattedData.length > 0 ? (
              <DataTable
                columns={columns}
                data={formattedData}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm ? "No sales found for the searched product ID." : "No sales data available."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

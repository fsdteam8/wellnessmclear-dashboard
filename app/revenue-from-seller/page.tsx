"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface RevenueData {
  sellerId: string
  productId: string
  revenueFromSeller: number
}

interface ApiResponse {
  status: boolean
  message: string
  data: RevenueData[]
}

const columns = [
  { key: "sellerId", label: "Seller ID" },
  { key: "productId", label: "Product ID" },
  { key: "revenue", label: "Revenue from Seller" },
]

// Fetch function for revenue data
const fetchRevenueData = async (): Promise<ApiResponse> => {
  // Get token from localStorage
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODNlZDVlYTY0ODUxNzk2MWZlYmQ2OGQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk4ODkzNzgsImV4cCI6MTc1MDQ5NDE3OH0.GkczutuRZ01PJuoWkHzoLx2PB_gBDkEGAfMyiN7-4XI"

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard/revenue-from-seller`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    },
  })

  if (!response.ok) {
    switch (response.status) {
      case 401:
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken")
        }
        throw new Error("Unauthorized - Please login again")
      case 403:
        throw new Error("Forbidden - You do not have permission")
      case 404:
        throw new Error("Resource not found")
      case 500:
        throw new Error("Internal server error")
      default:
        throw new Error(`Request failed with status ${response.status}`)
    }
  }

  return response.json()
}

export default function RevenueFromSellerPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Query for revenue data
  const {
    data: revenueData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["revenue-data"],
    queryFn: fetchRevenueData,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })

  // Format data for display
  const formattedData =
    revenueData?.data?.map((item, index) => ({
      id: index + 1,
      sellerId: item.sellerId,
      productId: item.productId,
      revenue: `$${item.revenueFromSeller.toFixed(2)}`,
    })) || []

  // Calculate total revenue
  const totalRevenue = revenueData?.data?.reduce((sum, item) => sum + item.revenueFromSeller, 0) || 0

  const totalItems = formattedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-red-600">Error loading revenue data: {error.message}</p>
            {error.message.includes("Unauthorized") && (
              <Button
                onClick={() => {
                  localStorage.removeItem("authToken")
                  window.location.href = "/login"
                }}
                className="mt-4 mr-2"
              >
                Login Again
              </Button>
            )}
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Revenue from Seller</h1>
            <p className="text-gray-500">Dashboard &gt; Revenue from Seller</p>
          </div>

          {/* Total Revenue Card */}
          <Card className="mb-8 bg-[#525773] text-white w-[470px] rounded-[8px]">
            <CardContent className="p-8">
              <div className="space-y-3">
                <p className="text-base opacity-90 ml-2">Total Revenue</p>
                <div className="flex items-center space-x-2">
                  <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-[16px] font-bold">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-[16px] font-bold">${totalRevenue.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue Details</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading revenue data...</span>
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
                  <p className="text-gray-500">No revenue data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

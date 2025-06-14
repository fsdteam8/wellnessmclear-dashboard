"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
// import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import Image from "next/image"
import { Product } from "@/type/types"

// Interface to match API response
interface ApiResourceRequest {
  _id: string
  title: string
  country: string
  states: string[]
  resourceType: string[]
  description: string
  price: number
  discountPrice: number
  quantity: number
  format: string
  file: {
    url: string | null
    type: string | null
  }
  thumbnail: string
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profileImage: string
  }
  status: string
  practiceAreas: string[]
  productId: string
  createdAt: string
  averageRating: number
  totalReviews: number
}

interface ApiResponse {
  success: boolean
  data: ApiResourceRequest[]
  message?: string
}

// Fetch function for TanStack Query
const fetchResources = async (): Promise<Product[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/get-all-resources`)
  
  if (!response.ok) {
    throw new Error("Failed to fetch resources")
  }

  const data: ApiResponse = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch resources")
  }

  // Filter only approved resources and transform to match Product interface
  const approvedResources = data.data
    .filter((resource: ApiResourceRequest) => resource.status === "approved")
    .map((resource: ApiResourceRequest) => ({
      id: parseInt(resource.productId) || 0,
      name: resource.title,
      price: `$${resource.price}`,
      discountPrice: `$${resource.discountPrice}`,
      quantity: resource.quantity,
      format: resource.format,
      date: new Date(resource.createdAt).toLocaleDateString() +
            "\n" +
            new Date(resource.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      thumbnail: resource.thumbnail || "/placeholder.svg?height=40&width=40",
    }))

  return approvedResources
}

const columns = [
  {
    key: "name",
    label: "Resource Name",
    render: (value: string, row: Product) => (
      <div className="flex items-center space-x-3">
        <Image
          src={row.thumbnail || "/placeholder.svg"}
          alt="Resource thumbnail"
          width={40}
          height={40}
          className="rounded"
        />
        <span className="max-w-xs truncate">{value}</span>
      </div>
    ),
  },
  { key: "id", label: "ID" },
  { key: "price", label: "Price" },
  { key: "discountPrice", label: "Discount Price" },
  { key: "quantity", label: "Quantity" },
  { key: "format", label: "Format" },
  {
    key: "date",
    label: "Date",
    render: (value: string) => <div className="whitespace-pre-line text-sm">{value}</div>,
  },
]

export default function ResourceListPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // TanStack Query to fetch resources
  const {
    data: resources = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['resources', 'approved'],
    queryFn: fetchResources,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const totalItems = resources.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleAddResource = () => {
    router.push("/resource-list/add")
  }

  const handleEdit = (resource: Product) => {
    router.push(`/resource-list/edit/${resource.id}`)
  }

  const handleDelete = (resource: Product) => {
    console.log("Delete resource:", resource)
    // After delete operation, you can refetch the data
    // refetch()
  }


  console.log("data ", resources)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading resources...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex flex-col justify-center items-center h-64">
              <div className="text-lg text-red-600 mb-4">
                Error loading resources: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "resource List" }]} /> */}

          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddResource}
              title="Resource List"
              buttonText="Add Resource"
            />
            <p className="text-gray-500 -mt-4">Dashboard &gt; resource List</p>
          </div>

          {/* <PageHeader title="Resource List" buttonText="Add Resource" onButtonClick={handleAddResource} /> */}

          <DataTable
            columns={columns}
            data={resources}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import Image from "next/image"
import { Product } from "@/type/types"

const mockResources: Product[] = [
  {
    id: 1140,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1142,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1141,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1140,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1140,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1140,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1141,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1145,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 1149,
    name: "Resource Name Admissibility of evidence in civil proceedings",
    price: "$8.00",
    discountPrice: "$0.25",
    quantity: 100,
    format: "All Format",
    date: "04/21/2025\n03:18pm",
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
]

const columns = [
  {
    key: "name",
    label: "Resource Name",
    render: (value: string, row: Product ) => (
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
  const totalItems = mockResources.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleAddResource = () => {
    router.push("/resource-list/add")
  }

  const handleEdit = (resource: Product ) => {
    router.push(`/resource-list/edit/${resource.id}`)
  }

  const handleDelete = (resource: Product) => {
    console.log("Delete resource:", resource)
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "resource List" }]} />

          <PageHeader title="Resource List" buttonText="Add Resource" onButtonClick={handleAddResource} />

          <DataTable
            columns={columns}
            data={mockResources}
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

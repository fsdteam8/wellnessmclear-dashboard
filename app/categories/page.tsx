"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
// import { CategoryStats } from "@/components/category-stats"

interface Category {
  id: number
  name: string
  date: string
  subcategories: number
}

// interface CategoryStats {
//   totalCategories: number
//   totalSubcategories: number
//   activeCategories: number
// }

interface Column {
  key: string
  label: string
  render?: (value: unknown, row: Category) => React.ReactNode
}

const mockCategories: Category[] = [
  { id: 1, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 2, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 3, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 4, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 5, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 6, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 7, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 8, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 9, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
  { id: 10, name: "Entertainment", date: "04/15/2025", subcategories: 10 },
]

const columns: Column[] = [
  {
    key: "name",
    label: "Name",
    render: (value: unknown) => (
      <Link href={`/categories/${(value as string).toLowerCase()}`} passHref>
        <Badge
          variant="secondary"
          className="bg-slate-600 text-white px-4 py-2 cursor-pointer hover:bg-slate-500 transition-colors"
        >
          {value as string}
        </Badge>
      </Link>
    ),
  },
  { key: "date", label: "Date" },
  { key: "subcategories", label: "List Of Sub_categories" },
]

export default function CategoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalItems = mockCategories.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleAddCategory = () => {
    router.push("/categories/add")
  }

  const handleEdit = (category: Category) => {
    router.push(`/categories/edit/${category.id}`)
  }

  const handleDelete = async (category: Category) => {
    if (
      confirm(
        `Are you sure you want to delete the category "${category.name}"? This will also delete all subcategories.`,
      )
    ) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        // In real app, refetch data here
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        })
      }
    }
  }

  // const statsData: CategoryStats = {
  //   totalCategories: 12,
  //   totalSubcategories: 45,
  //   activeCategories: 10,
  // }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "category" }]} />

          <PageHeader title="Category List" buttonText="Add Categories" onButtonClick={handleAddCategory} />

          {/* Add the stats component before the data table */}
          {/* <CategoryStats
            totalCategories={statsData.totalCategories}
            totalSubcategories={statsData.totalSubcategories}
            activeCategories={statsData.activeCategories}
          /> */}

          <DataTable
            columns={columns}
            data={mockCategories}
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

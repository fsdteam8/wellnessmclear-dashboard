"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { useToast } from "@/hooks/use-toast"
import { CategoryStats } from "@/components/category-stats"
import { Subcategory, SubcategoryStats, BaseColumn } from "@/type/types"

type SubcategoryColumn = BaseColumn<Subcategory>

const mockSubcategories: Subcategory[] = [
	{ id: 1, name: "Health", date: "04/15/2025" },
	{ id: 2, name: "Sports", date: "04/15/2025" },
	{ id: 3, name: "Entertainment", date: "04/15/2025" },
	{ id: 4, name: "Entertainment", date: "04/15/2025" },
	{ id: 5, name: "Entertainment", date: "04/15/2025" },
	{ id: 6, name: "Entertainment", date: "04/15/2025" },
	{ id: 7, name: "Entertainment", date: "04/15/2025" },
	{ id: 8, name: "Entertainment", date: "04/15/2025" },
	{ id: 9, name: "Entertainment", date: "04/15/2025" },
	{ id: 10, name: "Entertainment", date: "04/15/2025" },
]

const columns: SubcategoryColumn[] = [
	{ key: "name", label: "Name" },
	{ key: "date", label: "Date" },
]

const subcategoryStats: SubcategoryStats = {
	totalCategories: 1,
	totalSubcategories: mockSubcategories.length,
	activeCategories: 1,
}

export default function SubcategoryPage() {
	const router = useRouter()
	const params = useParams()
	const { toast } = useToast()
	const category = params.category as string
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10
	const totalItems = mockSubcategories.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)

	const handleAddSubcategory = () => {
		router.push(`/categories/${category}/add`)
	}

	const handleEdit = (subcategory: Subcategory) => {
		router.push(`/categories/${category}/edit/${subcategory.id}`)
	}

	const handleDelete = async (subcategory: Subcategory) => {
		if (confirm(`Are you sure you want to delete the subcategory "${subcategory.name}"?`)) {
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000))
				toast({
					title: "Success",
					description: "Subcategory deleted successfully",
				})
				// In real app, refetch data here
			} catch {
				toast({
					title: "Error",
					description: "Failed to delete subcategory",
					variant: "destructive",
				})
			}
		}
	}

	return (
		<div className="flex h-screen bg-gray-50">
			<div className="flex-1 overflow-auto">
				<div className="p-6">
					<Breadcrumb
						items={[
							{ label: "Dashboard", href: "/" },
							{ label: "Categories", href: "/categories" },
							{ label: category.charAt(0).toUpperCase() + category.slice(1) },
						]}
					/>

					<PageHeader
						title={`${category.charAt(0).toUpperCase() + category.slice(1)} List`}
						buttonText="Add sub_categories"
						onButtonClick={handleAddSubcategory}
					/>

					<CategoryStats
						totalCategories={subcategoryStats.totalCategories}
						totalSubcategories={subcategoryStats.totalSubcategories}
						activeCategories={subcategoryStats.activeCategories}
					/>

					<DataTable<Subcategory>
						columns={columns}
						data={mockSubcategories}
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

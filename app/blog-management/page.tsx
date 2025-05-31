"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import Image from "next/image"
import { Blog, BlogColumn } from "@/type/types"

const mockBlogs: Blog[] = [
	{
		id: 1,
		title: "Resource Name Admissibility of evidence in civil proc...",
		description:
			"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it",
		added: "04/21/2025 03:18pm",
		comments: 180,
		thumbnail: "/placeholder.svg?height=60&width=80",
	},
	{
		id: 2,
		title: "Resource Name Admissibility of evidence in civil proc...",
		description:
			"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it",
		added: "04/21/2025 03:18pm",
		comments: 180,
		thumbnail: "/placeholder.svg?height=60&width=80",
	},
	{
		id: 3,
		title: "Resource Name Admissibility of evidence in civil proc...",
		description:
			"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it",
		added: "04/21/2025 03:18pm",
		comments: 180,
		thumbnail: "/placeholder.svg?height=60&width=80",
	},
	{
		id: 4,
		title: "Resource Name Admissibility of evidence in civil proc...",
		description:
			"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it",
		added: "04/21/2025 03:18pm",
		comments: 180,
		thumbnail: "/placeholder.svg?height=60&width=80",
	},
	{
		id: 5,
		title: "Resource Name Admissibility of evidence in civil proc...",
		description:
			"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it",
		added: "04/21/2025 03:18pm",
		comments: 180,
		thumbnail: "/placeholder.svg?height=60&width=80",
	},
]

const columns: BlogColumn[] = [
	{
		key: "title",
		label: "Blog Name",
		render: (value: unknown, row: Blog) => (
			<div className="flex items-start space-x-3 max-w-md">
				<Image
					src={row.thumbnail || "/placeholder.svg"}
					alt="Blog thumbnail"
					width={80}
					height={60}
					className="rounded object-cover flex-shrink-0"
				/>
				<div className="min-w-0">
					<h3 className="font-medium text-gray-900 mb-1">
						{typeof value === "string" ? value : ""}
					</h3>
					<p className="text-sm text-gray-500 line-clamp-3">
						{row.description}
					</p>
				</div>
			</div>
		),
	},
	{ key: "added", label: "Added" },
	{ key: "comments", label: "Comments" },
]

export default function BlogManagementPage() {
	const router = useRouter()
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 5
	const totalItems = mockBlogs.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)

	const handleAddBlog = () => {
		router.push("/blog-management/add")
	}

	const handleEdit = (blog: Blog) => {
		router.push(`/blog-management/edit/${blog.id}`)
	}

	const handleDelete = (blog: Blog) => {
		console.log("Delete blog:", blog)
	}

	return (
		<div className="flex h-screen bg-gray-50">
			<div className="flex-1 overflow-auto">
				<div className="p-6">
					<Breadcrumb
						items={[
							{ label: "Dashboard", href: "/" },
							{ label: "Blog management" },
						]}
					/>

					<PageHeader
						title="Blog management"
						buttonText="Add blog"
						onButtonClick={handleAddBlog}
					/>

					<DataTable<Blog>
						columns={columns}
						data={mockBlogs}
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

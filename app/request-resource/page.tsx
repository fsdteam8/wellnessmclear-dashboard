"use client"

import { useState } from "react"
// import { Breadcrumb } from "@/components/breadcrumb"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"
import Image from "next/image"
import { ResourceRequest, ResourceColumn, ResourceStatus, Seller } from "@/type/types"

const mockRequests: ResourceRequest[] = [
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
	{
		id: 1140,
		name: "Resource Name Admissibility of evidence in civil proceedings",
		seller: { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
		price: "$8.00",
		discountPrice: "$0.25",
		quantity: 100,
		format: "All Format",
		date: "04/21/2025\n03:18pm",
		thumbnail: "/placeholder.svg?height=40&width=40",
		statuses: ["Approved", "Pending"],
	},
]

const columns: ResourceColumn[] = [
	{
		key: "name",
		label: "Resource Name",
		render: (value: unknown, row: ResourceRequest) => (
			<div className="flex items-center space-x-3">
				<Image
					src={row.thumbnail || "/placeholder.svg"}
					alt="Resource thumbnail"
					width={40}
					height={40}
					className="rounded"
				/>
				<span className="max-w-xs truncate">{String(value)}</span>
			</div>
		),
	},
	{
		key: "seller",
		label: "Seller Name",
		render: (value: unknown) => {
			const seller = value as Seller
			return (
				<div className="flex items-center space-x-2">
					<Avatar className="h-8 w-8">
						<AvatarImage src={seller.avatar || "/placeholder.svg"} />
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<span>{seller.name}</span>
				</div>
			)
		},
	},
	{ key: "id", label: "ID" },
	{ key: "price", label: "Price" },
	{ key: "discountPrice", label: "Discount Price" },
	{ key: "quantity", label: "Quantity" },
	{ key: "format", label: "Format" },
	{
		key: "date",
		label: "Date",
		render: (value: unknown) => <div className="whitespace-pre-line text-sm">{String(value)}</div>,
	},
	{
		key: "statuses",
		label: "Action",
		render: (value: unknown) => {
			const statuses = value as ResourceStatus[]
			return (
				<div className="flex items-center space-x-2">
					{statuses.map((status, index) => (
						<Badge
							key={index}
							variant={status === "Approved" ? "default" : status === "Pending" ? "secondary" : "destructive"}
							className={
								status === "Approved"
									? "bg-green-500 hover:bg-green-600"
									: status === "Pending"
									? "bg-orange-500 hover:bg-orange-600"
									: "bg-red-500 hover:bg-red-600"
							}
						>
							{status}
						</Badge>
					))}
					<Button variant="outline" size="sm">
						<MessageSquare className="h-4 w-4" />
					</Button>
				</div>
			)
		},
	},
]

export default function RequestResourcePage() {
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 7
	const totalItems = mockRequests.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)

	return (
		<div className="flex h-screen bg-gray-50">

			<div className="flex-1 overflow-auto">
				<div className="p-6">
					{/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Request Resource" }]} /> */}

					<div className="mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">Request Resource</h1>
						<p className="text-gray-500">Dashboard &gt; Request Resource</p>
					</div>

					<DataTable
						columns={columns}
						data={mockRequests}
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

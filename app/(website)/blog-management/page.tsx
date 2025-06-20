"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import Image from "next/image"
import type { Blog, BlogColumn } from "@/type/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

// Helper function to strip HTML tags and get plain text
const stripHtml = (html: string): string => {
  if (!html) return ""

  if (typeof window === "undefined") {
    // Server-side: use a simple regex approach
    return html.replace(/<[^>]*>?/gm, "").trim()
  } else {
    // Client-side: use DOMParser for better handling
    const doc = new DOMParser().parseFromString(html, "text/html")
    return (doc.body.textContent || "").trim()
  }
}

// Helper function to truncate text to a specific length
const truncateText = (text: string, maxLength = 150): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

const columns: BlogColumn[] = [
  {
    key: "title",
    label: "Blog Name",
    render: (value: unknown, row: Blog) => (
      <div className="flex items-start space-x-3 max-w-md">
        <div className="w-[100px] h-[60px]">
          <Image
            src={row.thumbnail || "/images/NoImage.webp"}
            alt="Blog thumbnail"
            width={80}
            height={60}
            className="rounded object-cover w-full h-full flex-shrink-0"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 mb-1">{typeof value === "string" ? value : ""}</h3>
          <p className="text-sm text-gray-500 line-clamp-3">
            {row.description ? truncateText(stripHtml(row.description)) : "No description available"}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Added",
    render: (value: unknown) => {
      if (typeof value === "string") {
        const date = new Date(value)
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
      return ""
    },
  },
  {
    key: "comments",
    label: "Comments",
    render: () => "0",
  },
]

export default function BlogManagementPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const session = useSession();
  console.log("session", session);

  const TOKEN = session?.data?.accessToken;

  // Set up query client for cache invalidation
  const queryClient = useQueryClient()
  
  const {
    data: blogsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/blog/`)
      if (!res.ok) {
        throw new Error("Failed to fetch blogs")
      }
      return res.json()
    },
  })

  // Set up delete mutation with TanStack Query
  const deleteMutation = useMutation({
    mutationFn: async (blog: Blog) => {
      const blogId = blog._id || blog.id
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/blog/${blogId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete blog")
      }

      return blogId
    },
    onSuccess: () => {
      // Invalidate and refetch the data after successful deletion
      queryClient.invalidateQueries({ queryKey: ["blog"] })
    },
    onError: (error) => {
      console.error("Delete failed:", error)
      // You can add toast notification here if you have one
    },
  })

  console.log("blogs", blogsResponse?.data)

  // Get the actual blogs array from the response
  const allBlogs = blogsResponse?.data || []

  // Calculate pagination values
  const totalItems = allBlogs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Get paginated data for current page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageBlogs = allBlogs.slice(startIndex, endIndex)

  const handleAddBlog = () => {
    router.push("/blog-management/add")
  }

  const handleEdit = (blog: Blog) => {
    router.push(`/blog-management/edit/${blog._id}`)
  }

  const handleDelete = async (blog: Blog) => {
    try {
      await deleteMutation.mutateAsync(blog)
      console.log("Blog deleted successfully:", blog.title)
      // You can add toast notification here for success
    } catch (error) {
      console.error("Failed to delete blog:", error)
      // You can add toast notification here for error
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <PageHeader title="Blog management" buttonText="Add blog" onButtonClick={handleAddBlog} />
          <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Blog management" }]} />

          {isLoading ? (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <div className="border border-[#707070]">
                  {/* Table Header Skeleton */}
                  <div className="border border-[#707070] p-4">
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Table Rows Skeleton */}
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <div key={index} className="border border-[#707070] p-4">
                      <div className="flex items-start space-x-3">
                        {/* Image skeleton */}
                        <div className="w-[100px] h-[60px] bg-gray-200 rounded animate-pulse flex-shrink-0"></div>

                        {/* Content skeleton */}
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>

                        {/* Date skeleton */}
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>

                        {/* Comments skeleton */}
                        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>

                        {/* Actions skeleton */}
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="flex space-x-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
              Error loading blogs: {error instanceof Error ? error.message : "Unknown error"}
            </div>
          ) : (
            <DataTable<Blog>
              columns={columns}
              data={currentPageBlogs}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import Image from "next/image"
import type { Blog, BlogColumn } from "@/type/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import noImage from "@/public/images/NoImage.png";

// Custom Image component with fallback
const ImageWithFallback = ({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: { 
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (src && src.trim()) {
      return src.trim();
    }
    return noImage.src || "/images/NoImage.png";
  });
  
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(noImage.src || "/images/NoImage.png");
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
};

const stripHtml = (html: string): string => {
  if (!html) return ""

  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>?/gm, "").trim()
  } else {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return (doc.body.textContent || "").trim()
  }
}

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
          <ImageWithFallback
            src={row.image}
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
]

export default function BlogManagementPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const session = useSession()
  const TOKEN = session?.data?.accessToken

  const queryClient = useQueryClient()
  
  const {
    data: blogsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blog/`)
      if (!res.ok) {
        throw new Error("Failed to fetch blogs")
      }
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (blog: Blog) => {
      const blogSlug = blog.slug
      if (!blogSlug) {
        throw new Error("Blog slug is required for deletion")
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blog/${blogSlug}`, {
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

      return blogSlug
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] })
    },
    onError: (error) => {
      console.error("Delete failed:", error)
      // add toast or error handling here if needed
    },
  })

  // Extract blogs from response properly
  const allBlogs = blogsResponse?.data?.blogs || []

  // Pagination calculations
  const totalItems = allBlogs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageBlogs = allBlogs.slice(startIndex, endIndex)

  const handleAddBlog = () => {
    router.push("/blog-management/add")
  }

  const handleEdit = (blog: Blog) => {
    if (!blog.slug) {
      console.error("Blog slug is missing")
      return
    }
    router.push(`/blog-management/edit/${blog.slug}`)
  }

  const handleDelete = async (blog: Blog) => {
    if (!blog.slug) {
      console.error("Blog slug is missing")
      return
    }
    
    try {
      await deleteMutation.mutateAsync(blog)
      // success handling here
    } catch (error) {
      // error handling here
      console.log(error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex bg-gray-50">
      <div className="w-full">
        <div className="p-6">
          <PageHeader title="Blog management" buttonText="Add blog" onButtonClick={handleAddBlog} />
          <p className="text-gray-500 -mt-5 mb-10" >Dashboard &gt; Blog management</p>

          {isLoading ? (
            <div className="space-y-4">
              {/* Add your skeleton loader code here */}
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
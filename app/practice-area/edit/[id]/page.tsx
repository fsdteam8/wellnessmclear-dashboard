"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Mock data - in real app, this would come from API
const mockCategories = {
  1: { id: 1, name: "Entertainment", description: "Entertainment category description" },
  2: { id: 2, name: "Health", description: "Health category description" },
  3: { id: 3, name: "Sports", description: "Sports category description" },
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const categoryId = params.id as string

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    // Simulate loading category data
    const loadCategory = async () => {
      setIsLoadingData(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        const category = mockCategories[parseInt(categoryId) as keyof typeof mockCategories]
        if (category) {
          setFormData({
            name: category.name,
            description: category.description,
          })
        } else {
          toast({
            title: "Error",
            description: "Category not found",
            variant: "destructive",
          })
          router.push("/categories")
        }
      } catch  {
        toast({
          title: "Error",
          description: "Failed to load category",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadCategory()
  }, [categoryId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
      router.push("/categories")
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/categories")
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: "Edit Category" }, // Current page
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Category</h1>
            <p className="text-gray-500">Dashboard &gt; Categories &gt; Edit Category</p>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Type category name here..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type category description here..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-slate-600 hover:bg-slate-700">
                  {isLoading ? "Updating..." : "Update Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

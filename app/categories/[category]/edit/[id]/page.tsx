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
const mockSubcategories = {
  entertainment: {
    1: { id: 1, name: "Movies", description: "Movies subcategory description" },
    2: { id: 2, name: "Music", description: "Music subcategory description" },
    3: { id: 3, name: "Games", description: "Games subcategory description" },
  },
  health: {
    1: { id: 1, name: "Fitness", description: "Fitness subcategory description" },
    2: { id: 2, name: "Nutrition", description: "Nutrition subcategory description" },
  },
  sports: {
    1: { id: 1, name: "Football", description: "Football subcategory description" },
    2: { id: 2, name: "Basketball", description: "Basketball subcategory description" },
  },
}

export default function EditSubcategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const category = params.category as string
  const subcategoryId = params.id as string

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    // Simulate loading subcategory data
    const loadSubcategory = async () => {
      setIsLoadingData(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        const categoryData = mockSubcategories[category as keyof typeof mockSubcategories]
        const subcategory = categoryData?.[Number(subcategoryId) as keyof typeof categoryData]

        if (subcategory) {
          setFormData({
            name: subcategory.name,
            description: subcategory.description,
          })
        } else {
          toast({
            title: "Error",
            description: "Subcategory not found",
            variant: "destructive",
          })
          router.push(`/categories/${category}`)
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load subcategory",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadSubcategory()
  }, [category, subcategoryId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Subcategory name is required",
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
        description: "Subcategory updated successfully",
      })
      router.push(`/categories/${category}`)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update subcategory",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/categories/${category}`)
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subcategory...</p>
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
              { label: category.charAt(0).toUpperCase() + category.slice(1), href: `/categories/${category}` },
              { label: "Edit Subcategory" },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Subcategory</h1>
            <p className="text-gray-500">
              Dashboard &gt; Categories &gt; {category.charAt(0).toUpperCase() + category.slice(1)} &gt; Edit
              Subcategory
            </p>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">Subcategory Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Subcategory Name</Label>
                <Input
                  id="name"
                  placeholder="Type subcategory name here..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type subcategory description here..."
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
                  {isLoading ? "Updating..." : "Update Subcategory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

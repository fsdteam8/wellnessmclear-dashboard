"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
// import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AddSubcategoryPage() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as string
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sub-category name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Sub-category created successfully",
      })
      router.push(`/categories/${category}`)
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: category.charAt(0).toUpperCase() + category.slice(1), href: `/categories/${category}` },
              { label: "Add Subcategory" }, // Current page
            ]}
          /> */}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {category.charAt(0).toUpperCase() + category.slice(1)} List
            </h1>
            <p className="text-gray-500">Dashboard &gt; category &gt; sub_category</p>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">Sub_categories Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">sub_category Name</Label>
                <Input
                  id="name"
                  placeholder="Type sub_category name here..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type sub_category description here..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="bg-slate-600 hover:bg-slate-700">
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

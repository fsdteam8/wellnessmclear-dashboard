"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function EditResourceTypePage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs"

  const [formData, setFormData] = useState({
    resourceTypeName: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoadingData(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource-type/${categoryId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        if (!res.ok) throw new Error("Resource not found")
        const json = await res.json()
    console.log('json', json)
        setFormData({
          resourceTypeName: json.data.resourceTypeName,
          description: json.data.description,
        })
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("Failed to load Resource Type")
        }
        router.push("/resource-type")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.resourceTypeName.trim()) {
      toast.error("Resource Type name is required")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource-type/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            resourceTypeName: formData.resourceTypeName,
            description: formData.description,
          }),
        }
      )

      if (!res.ok) throw new Error("Failed to update Resource Type")

      toast.success("Resource Type updated successfully")
      

      setTimeout(() => {
        router.push("/resource-type")
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to update Resource Type")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/resource-type")
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Resource Type...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Resource Type
            </h1>
            <p className="text-gray-500">
              Dashboard &gt; Resource Type &gt; Edit Resource Type
            </p>
          </div>

          <div className="rounded-lg">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Resource Type Name</Label>
                <Input
                  id="name"
                  placeholder="Type resource type name here..."
                  value={formData.resourceTypeName}
                  onChange={(e) =>
                    setFormData({ ...formData, resourceTypeName: e.target.value })
                  }
                  className="mt-3 h-[49px] border border-[#707070]"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type resource type description here..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-3 min-h-[150px] border border-[#707070]"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  {isLoading ? "Updating..." : "Update Resource Type"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

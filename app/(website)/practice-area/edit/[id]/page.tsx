"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { PuffLoader } from "react-spinners"

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const session = useSession();
  console.log("session", session);

  const TOKEN = session?.data?.accessToken;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoadingData(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/practice-area/${categoryId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        if (!res.ok) throw new Error("Category not found")
        const json = await res.json()
        setFormData({
          name: json.data.name,
          description: json.data.description,
        })
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("Failed to load category")
        }
        router.push("/practice-area")
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

    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/practice-area/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify(formData),
        }
      )

      if (!res.ok) throw new Error("Failed to update category")

      toast.success("Category updated successfully")

      setTimeout(() => {
        router.push("/practice-area")
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to update category")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/practice-area")
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-gray-50">
              <div className="text-center">
                {/* Optional: Remove this if you only want MoonLoader */}
                {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div> */}
                <PuffLoader
                  color="rgba(49, 23, 215, 1)"
                  cssOverride={{}}
                  loading
                  speedMultiplier={1}
                />
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
              Edit Practice Areas
            </h1>
            <p className="text-gray-500">
              Dashboard &gt; Practice Areas &gt; Edit Practice Areas
            </p>
          </div>

          <div className="rounded-lg">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Practice Area Name</Label>
                <Input
                  id="name"
                  placeholder="Type category name here..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-3 h-[49px] border border-[#707070]"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type category description here..."
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

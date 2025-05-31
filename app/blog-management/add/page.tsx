"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AddBlogPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Blog title is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Blog saved successfully",
      })
      router.push("/blog-management")
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Blog management", href: "/blog-management" },
            ]}
          />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Blog management</h1>
              <p className="text-gray-500">Dashboard &gt; Blog management</p>
            </div>
            <Button type="submit" form="blog-form" disabled={isLoading} className="bg-slate-600 hover:bg-slate-700">
              {isLoading ? "Saving..." : "Save blog"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6">
                <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Blog Title</Label>
                    <Input
                      id="title"
                      placeholder="Add your title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <div className="mt-1">
                      <Textarea
                        id="description"
                        placeholder="Description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="min-h-[300px]"
                      />
                      <div className="flex items-center justify-between mt-2 p-2 border-t">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Font</span>
                          <Select defaultValue="body">
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="body">Body</SelectItem>
                              <SelectItem value="heading">Heading</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="sm">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <Underline className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">Alignment</span>
                          <Button type="button" variant="outline" size="sm">
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <AlignRight className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <AlignJustify className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6">
                <Label>Thumbnail</Label>
                <Card className="mt-2">
                  <CardContent className="p-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Upload thumbnail</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

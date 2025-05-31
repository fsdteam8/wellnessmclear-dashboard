"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Save } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - in real app, this would come from API
const mockCodes = {
  1: { id: 1, code: "JEOFO23", discount: "$2", startDate: "03/05/2025", endDate: "20/05/2025", status: "Active" },
  2: { id: 2, code: "SUMMER24", discount: "15%", startDate: "01/06/2025", endDate: "31/08/2025", status: "Schedule" },
}

export default function EditCodePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const codeId = params.id as string

  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    startDate: undefined as Date | undefined,
    expiryDate: undefined as Date | undefined,
    status: "Active",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const loadCodeData = async () => {
      setIsLoadingData(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        const codeData = mockCodes[parseInt(codeId) as keyof typeof mockCodes]
        if (codeData) {
          setFormData({
            code: codeData.code,
            discount: codeData.discount,
            startDate: parse(codeData.startDate, "dd/MM/yyyy", new Date()),
            expiryDate: parse(codeData.endDate, "dd/MM/yyyy", new Date()),
            status: codeData.status,
          })
        } else {
          toast({
            title: "Error",
            description: "Promo code not found",
            variant: "destructive",
          })
          router.push("/promo-code")
        }
      } catch  {
        toast({
          title: "Error",
          description: "Failed to load promo code data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }
    if (codeId) {
      loadCodeData()
    }
  }, [codeId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.discount.trim() || !formData.startDate || !formData.expiryDate) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }
    if (formData.code.length < 5 || formData.code.length > 10) {
      toast({
        title: "Error",
        description: "Code must be between 5 and 10 characters",
        variant: "destructive",
      })
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(formData.code)) {
      toast({
        title: "Error",
        description: "Code must be alphanumeric",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Promo code updated successfully",
      })
      router.push("/promo-code")
    }, 1000)
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading promo code...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Promo Code", href: "/promo-code" },
              { label: "Edit Code" },
            ]}
          />

          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Code</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; code</p>
          </div>

          <div className="p-8 shadow">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code (5-10 chars, alphanumeric)
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1"
                    maxLength={10}
                    minLength={5}
                  />
                </div>

                <div>
                  <Label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </Label>
                  <Input
                    id="discount"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., $10 or 10%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div>
                  <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !formData.startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "dd / MM / yyyy")
                        ) : (
                          <span>DD / MM / YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !formData.expiryDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiryDate ? (
                          format(formData.expiryDate, "dd / MM / yyyy")
                        ) : (
                          <span>DD / MM / YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiryDate}
                        onSelect={(date) => setFormData({ ...formData, expiryDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Schedule">Schedule</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="bg-slate-700 hover:bg-slate-800 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div> 
        </div>
      </div>
    </div>
  )
}

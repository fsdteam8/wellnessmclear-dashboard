"use client"

import type React from "react"
import { useState } from "react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ChangePasswordPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Setting", href: "/setting" },
              { label: "Change Password" },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
            <p className="text-gray-500">Dashboard &gt; Setting &gt; Change Password</p>
          </div>

          <div className="bg-white rounded-lg p-6 max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-slate-600 hover:bg-slate-700">
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

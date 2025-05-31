"use client"

import { useState } from "react"
// import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PersonalInformationPage() {
  // const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "Mr. Raja",
    userName: "raja123",
    email: "raja123@gmail.com",
    phoneNumber: "+1 (888) 000-0000",
    gender: "",
    dateOfBirth: "",
    address: "00000 Artesia Blvd, Suite A-000",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateProfile = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setIsEditing(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    setFormData({
      fullName: "Mr. Raja",
      userName: "raja123",
      email: "raja123@gmail.com",
      phoneNumber: "+1 (888) 000-0000",
      gender: "",
      dateOfBirth: "",
      address: "00000 Artesia Blvd, Suite A-000",
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Setting", href: "/setting" },
              { label: "Personal information" },
            ]}
          />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Setting</h1>
              <p className="text-gray-500">Dashboard &gt; Setting &gt; Personal information</p>
            </div>
            {!isEditing && (
              <Button onClick={handleUpdateProfile} className="bg-slate-600 hover:bg-slate-700">
                Update Profile
              </Button>
            )}
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Mr. Raja</h2>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <Label>Full Name</Label>
                  <Input value={formData.fullName} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email} readOnly className="mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userName">User Name</Label>
                    <Input
                      id="userName"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative mt-1">
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        placeholder="Set your Birthday"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading} className="bg-slate-600 hover:bg-slate-700">
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

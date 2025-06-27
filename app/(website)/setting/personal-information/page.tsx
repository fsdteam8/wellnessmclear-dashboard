"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
// import { AccountLayout } from "@/components/account/account-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SquareArrowOutUpRight, Camera, Trash2, Loader2 } from "lucide-react"
// import LegalDoc from "@/components/HomePage/LegalDoc"
import { useSession } from "next-auth/react"

declare module "next-auth" {
  interface User {
    id: string
    accessToken?: string
  }
  interface Session {
    // user: User
    accessToken: string
  }
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface Address {
  country: string
  cityState: string
  roadArea: string
  postalCode: number
  taxId: string
}

interface UserData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: Address
  profileImage: string
}

interface data {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  cityState: string
  roadArea: string
  postalCode: number
  taxId: string
  profileImage: string
}

// Loading Component
const ProfileLoadingSkeleton = () => (
  <div className="rounded-lg mb-10">
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 bg-[#6459490D] px-6 py-8 rounded-[12px]">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 w-48"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-64"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
      </div>
    </div>

    <div className="bg-[#6459490D] p-6 rounded-[12px]">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(9)].map((_, index) => (
          <div key={index} className={index === 6 ? "md:col-span-2" : ""}>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-24"></div>
            <div className="h-[49px] bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Error Component
const ProfileError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load profile data</h3>
    <p className="text-gray-600 mb-4">Something went wrong while fetching your profile information.</p>
    <Button onClick={onRetry} className="bg-[#2c5d7c] hover:bg-[#1e4258]">
      Try Again
    </Button>
  </div>
)

// Loading Overlay Component
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[12px] z-10">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#2c5d7c]" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  </div>
)

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    cityState: "",
    roadArea: "",
    postalCode: 0,
    taxId: "",
    profileImage: "",
  })
  const [imageKey, setImageKey] = useState(0) // Force image re-render
  const [imageLoading, setImageLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const session = useSession()
  const userId = session?.data?.user?.id
  const token = session?.data?.accessToken
  // console.log(session)
  console.log(token)

  const queryClient = useQueryClient()

  const fetchUserById = async (userId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error("Failed to fetch user data")

    const response = await res.json()
    return response.data as UserData
  }

  const updateUserById = async ({
    userId,
    token,
    data,
  }: {
    userId: string
    token: string
    data: typeof formData
  }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        address: {
          country: data.country,
          cityState: data.cityState,
          roadArea: data.roadArea,
          postalCode: data.postalCode,
          taxId: data.taxId,
        },
        profileImage: data.profileImage,
      }),
    })

    const response = await res.json()

    if (!res.ok) {
      throw new Error(response.message || "Failed to update user")
    }

    return response // Return full response for message access
  }

  // Image upload function
  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("profileImage", file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/upload-avatar/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const response = await res.json()

    if (!res.ok) {
      throw new Error(response.message || "Failed to upload image")
    }

    return response
  }

  // Image delete function
  const deleteImage = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/upload-avatar/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const response = await res.json()

    if (!res.ok) {
      throw new Error(response.message || "Failed to delete image")
    }

    return response
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: !!userId && !!token,
  })

  const updateMutation = useMutation({
    mutationFn: (data: data) => updateUserById({ userId: userId!, token: token!, data }),
    onSuccess: (response) => {
      toast.success(response.message || "Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
      setIsEditing(false)
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (response) => {
      toast.success(response.message || "Image uploaded successfully")
      setImageKey((prev) => prev + 1) // Force image re-render
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image")
    },
  })

  // Image delete mutation
  const deleteImageMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: (response) => {
      toast.success(response.message || "Image deleted successfully")
      setImageKey((prev) => prev + 1) // Force image re-render
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete image")
    },
  })

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phoneNumber || "",
        country: data.address?.country || "",
        cityState: data.address?.cityState || "",
        roadArea: data.address?.roadArea || "",
        postalCode: Number(data.address?.postalCode) || 0,
        taxId: data.address?.taxId || "",
        profileImage: data?.profileImage || "",
      })
      // Update image key when data changes to force re-render
      setImageKey((prev) => prev + 1)
    }
  }, [data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "postalCode" ? Number(value) : value,
    }))
  }

  const handleUpdate = () => {
    updateMutation.mutate(formData)
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      uploadImageMutation.mutate(file)
    }
  }

  // Handle image upload button click
  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  // Handle image delete
  const handleImageDelete = () => {
    if (window.confirm("Are you sure you want to delete your profile image?")) {
      deleteImageMutation.mutate()
    }
  }

  // Handle image load start
  const handleImageLoadStart = () => {
    setImageLoading(true)
  }

  // Handle image load complete
  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Check if any operation is in progress
  const isAnyOperationPending =
    updateMutation.isPending || uploadImageMutation.isPending || deleteImageMutation.isPending

  return (
    <div>
      
        {isLoading ? (
          <ProfileLoadingSkeleton />
        ) : isError ? (
          <ProfileError onRetry={() => refetch()} />
        ) : (
          <div className="rounded-lg mb-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 bg-[#6459490D] px-6 py-8 rounded-[12px] relative">
              {/* Loading overlay for profile section */}
              {(uploadImageMutation.isPending || deleteImageMutation.isPending) && (
                <LoadingOverlay message={uploadImageMutation.isPending ? "Uploading image..." : "Deleting image..."} />
              )}

              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border relative">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  )}
                  <Image
                    key={imageKey} // Force re-render when imageKey changes
                    src={`${data?.profileImage || "/images/not-imge.png"}?t=${imageKey}`} // Cache busting
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover"
                    unoptimized // Disable Next.js optimization for dynamic images
                    onLoadStart={handleImageLoadStart}
                    onLoad={handleImageLoad}
                    onError={handleImageLoad}
                  />
                </div>
                {/* Image upload/delete controls */}
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <Button
                    size="sm"
                    className="w-8 h-8 p-0 rounded-full bg-[#2c5d7c] hover:bg-[#1e4258] disabled:opacity-50"
                    onClick={handleImageUpload}
                    disabled={uploadImageMutation.isPending || deleteImageMutation.isPending}
                    title="Upload new image"
                  >
                    {uploadImageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                  {data?.profileImage && data.profileImage !== "/images/not-imge.png" && (
                    <Button
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50"
                      onClick={handleImageDelete}
                      disabled={deleteImageMutation.isPending || uploadImageMutation.isPending}
                      title="Delete current image"
                    >
                      {deleteImageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isAnyOperationPending}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-gray-500 mb-2">
                  @{formData.firstName.toLowerCase()}
                  {formData.lastName.toLowerCase()}
                </p>
                <p className="text-gray-700">
                  {formData.roadArea}, {formData.cityState}, {formData.country}, {formData.postalCode}
                </p>
                <Button
                  className="mt-4 bg-[#2c5d7c] hover:bg-[#1e4258]"
                  onClick={() => (window.location.href = "/dashboard")}
                  disabled={isAnyOperationPending}
                >
                  <SquareArrowOutUpRight className="mr-2" />
                  Go To Dashboard
                </Button>
              </div>
            </div>

            <div className="bg-[#6459490D] p-6 rounded-[12px] relative">
              {/* Loading overlay for form section */}
              {updateMutation.isPending && <LoadingOverlay message="Updating profile..." />}

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Personal Information</h3>
                <Button
                  className="bg-[#2c5d7c] hover:bg-[#1e4258] disabled:opacity-50"
                  onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
                  disabled={isAnyOperationPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SquareArrowOutUpRight className="mr-2" />
                      {isEditing ? "Save" : "Update"}
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "First Name", name: "firstName" },
                  { label: "Last Name", name: "lastName" },
                  {
                    label: "Email Address",
                    name: "email",
                    type: "email",
                    readOnly: true,
                  },
                  { label: "Phone", name: "phone" },
                  { label: "Country", name: "country" },
                  { label: "City/State", name: "cityState" },
                  { label: "Road/Area", name: "roadArea", span: true },
                  { label: "Postal Code", name: "postalCode" },
                  { label: "TAX ID", name: "taxId" },
                ].map(({ label, name, type = "text", span, readOnly }) => (
                  <div key={name} className={span ? "md:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    {isEditing && !readOnly ? (
                      <Input
                        name={name}
                        value={
                          name === "postalCode"
                            ? formData.postalCode.toString()
                            : formData[name as keyof typeof formData]
                        }
                        onChange={handleChange}
                        className="w-full h-[49px] border border-[#645949] disabled:opacity-50"
                        type={name === "postalCode" ? "number" : type}
                        disabled={isAnyOperationPending}
                      />
                    ) : (
                      <div
                        className={`p-2.5 border rounded-md h-[49px] border-[#645949] ${
                          readOnly ? "bg-gray-100 text-gray-500" : "bg-gray-50"
                        }`}
                      >
                        {formData[name as keyof typeof formData]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

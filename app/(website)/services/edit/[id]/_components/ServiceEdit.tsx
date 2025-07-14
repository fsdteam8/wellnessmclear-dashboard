/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Image, Users, Gift, X, Loader2 } from "lucide-react";
import NextImage from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Types
type ServiceData = {
  _id: string;
  icon: string;
  title: string;
  description: string;
  price: number;
  overview: string;
  overviewImage: string;
  receive: string;
  receiveImage: string;
  whom: string;
  whomImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ServiceResponse = {
  status: boolean;
  message: string;
  data: ServiceData;
};

type PreviewUrls = {
  overviewImage: string | null;
  receiveImage: string | null;
  whomImage: string | null;
  icon: string | null;
};

type FileStates = {
  overviewImage: File | null;
  receiveImage: File | null;
  whomImage: File | null;
  icon: File | null;
};

// Base URL
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const fetchService = async (serviceId: string): Promise<ServiceResponse> => {
  const response = await fetch(`${BASE_URL}/service/${serviceId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch service: ${response.statusText}`);
  }
  return response.json();
};

const updateService = async ({
  serviceId,
  data,
  files,
  token,
}: {
  serviceId: string;
  data: Partial<ServiceData>;
  files: FileStates;
  token?: string;
}): Promise<ServiceResponse> => {
  const formData = new FormData();
  
  // Append text data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  // Append file data
  Object.entries(files).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/service/${serviceId}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 
      `Failed to update service: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

const ServiceEdit = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const serviceId = params?.id as string;
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    overview: "",
    receive: "",
    whom: "",
  });

  const [previewUrls, setPreviewUrls] = useState<PreviewUrls>({
    overviewImage: null,
    receiveImage: null,
    whomImage: null,
    icon: null,
  });

  const [fileStates, setFileStates] = useState<FileStates>({
    overviewImage: null,
    receiveImage: null,
    whomImage: null,
    icon: null,
  });

  const [isModified, setIsModified] = useState(false);

  // Fetch service data
  const {
    data: serviceResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => fetchService(serviceId),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: (data) => {
      // Update the cache with the new data
      // router.push("/services")
      window.location.href = "/services"
      queryClient.setQueryData(["service", serviceId], data);
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: ["services"], // Invalidate services list
      });
      queryClient.invalidateQueries({
        queryKey: ["service", serviceId], // Invalidate current service
      });
      
      // Reset form state
      setIsModified(false);
      
      // Clear file states after successful update
      setFileStates({
        overviewImage: null,
        receiveImage: null,
        whomImage: null,
        icon: null,
      });
      
      // Clear any blob URLs for file previews
      Object.values(previewUrls).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Reset preview URLs to server images
      if (data.data) {
        const service = data.data;
        setPreviewUrls({
          overviewImage: service.overviewImage || null,
          receiveImage: service.receiveImage || null,
          whomImage: service.whomImage || null,
          icon: service.icon || null,
        });
      }
      
      toast.success("Service updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast.error(`Failed to update service: ${error.message}`);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["service", variables.serviceId],
      });

      // Snapshot the previous value
      const previousService = queryClient.getQueryData<ServiceResponse>([
        "service",
        variables.serviceId,
      ]);

      // Optimistically update the cache
      if (previousService) {
        const optimisticData: ServiceResponse = {
          ...previousService,
          data: {
            ...previousService.data,
            ...variables.data,
            updatedAt: new Date().toISOString(),
          },
        };
        
        queryClient.setQueryData(["service", variables.serviceId], optimisticData);
      }

      // Return a context object with the snapshotted value
      return { previousService };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["service", serviceId],
      });
    },
  });

  // Initialize form data when service data is loaded
  useEffect(() => {
    if (serviceResponse?.data) {
      const service = serviceResponse.data;
      setFormData({
        title: service.title || "",
        price: service.price?.toString() || "",
        description: service.description || "",
        overview: service.overview || "",
        receive: service.receive || "",
        whom: service.whom || "",
      });

      setPreviewUrls({
        overviewImage: service.overviewImage || null,
        receiveImage: service.receiveImage || null,
        whomImage: service.whomImage || null,
        icon: service.icon || null,
      });

      setIsModified(false);
    }
  }, [serviceResponse]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsModified(true);
  };

  const handleFilePreview = (field: keyof PreviewUrls, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Clean up previous blob URL if it exists
    if (previewUrls[field]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[field]!);
    }

    // Create new blob URL
    const url = URL.createObjectURL(file);
    
    // Update states
    setPreviewUrls((prev) => ({ ...prev, [field]: url }));
    setFileStates((prev) => ({ ...prev, [field]: file }));
    setIsModified(true);
  };

  const clearFilePreview = (field: keyof PreviewUrls) => {
    // Clean up blob URL if it exists
    if (previewUrls[field]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[field]!);
    }
    
    // Reset to original server image if it exists
    const originalImage = serviceResponse?.data ? serviceResponse.data[field as keyof ServiceData] : null;
    
    setPreviewUrls((prev) => ({ 
      ...prev, 
      [field]: typeof originalImage === 'string' ? originalImage : null 
    }));
    setFileStates((prev) => ({ ...prev, [field]: null }));
    
    // Clear file input
    const input = document.getElementById(field) as HTMLInputElement;
    if (input) input.value = "";
    
    setIsModified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.price.trim()) {
      toast.error("Price is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const updateData = {
      title: formData.title.trim(),
      price: priceValue,
      description: formData.description.trim(),
      overview: formData.overview.trim(),
      receive: formData.receive.trim(),
      whom: formData.whom.trim(),
    };

    updateMutation.mutate({ 
      serviceId, 
      data: updateData,
      files: fileStates,
      token: session?.accessToken, // Pass authentication token
    });
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const FileUpload = ({
    field,
    label,
    icon: Icon,
  }: {
    field: keyof PreviewUrls;
    label: string;
    icon: React.ElementType;
  }) => (
    <div className="space-y-3">
      <Label htmlFor={field} className="flex items-center gap-2 font-semibold">
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      <Input
        id={field}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFilePreview(field, e.target.files[0]);
          }
        }}
        className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
      />
      {previewUrls[field] && (
        <div className="mt-4 bg-gray-50 border p-3 rounded-lg relative max-w-xs">
          <Button
            type="button"
            onClick={() => clearFilePreview(field)}
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 p-1 h-6 w-6 z-10 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-red-500" />
          </Button>
          <div className="relative w-full h-32">
            <NextImage
              src={previewUrls[field]!}
              alt={`${label} preview`}
              fill
              className="object-cover rounded-md w-full"
              unoptimized={previewUrls[field]?.startsWith("blob:")}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {fileStates[field] ? "New file selected" : "Current image"}
          </p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-[#F8FAF9] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A8C2A3] mx-auto mb-4" />
          <p className="text-gray-600">Loading service data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8FAF9] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading service: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button onClick={() => refetch()} className="bg-[#A8C2A3] hover:bg-[#96B091]">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!serviceResponse?.data) {
    return (
      <div className="bg-[#F8FAF9] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No service data found</p>
          <Button onClick={() => refetch()} className="bg-[#A8C2A3] hover:bg-[#96B091]">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAF9] min-h-screen">
      <form onSubmit={handleSubmit} className="">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Edit Service</h2>
                <p className="text-sm text-gray-500">
                  Dashboard &gt; Services &gt; Edit &gt; {serviceResponse.data.title}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!isModified || updateMutation.isPending}
                  className="bg-[#A8C2A3] text-white hover:bg-[#96B091] disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Service"
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-10">
            {/* Title, Price, Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  className="h-[50px] border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="h-[50px] border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write description..."
                className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3] resize-none"
                required
              />
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="overview" className="font-semibold">
                  Overview Text
                </Label>
                <Textarea
                  id="overview"
                  name="overview"
                  rows={6}
                  value={formData.overview}
                  onChange={handleInputChange}
                  className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3] resize-none"
                  placeholder="Overview content"
                />
              </div>
              <FileUpload field="overviewImage" label="Overview Image" icon={Image} />
            </div>

            {/* Receive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="receive" className="font-semibold">
                  Receive Details
                </Label>
                <Textarea
                  id="receive"
                  name="receive"
                  rows={6}
                  value={formData.receive}
                  onChange={handleInputChange}
                  className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3] resize-none"
                  placeholder="What users will receive"
                />
              </div>
              <FileUpload field="receiveImage" label="Receive Image" icon={Gift} />
            </div>

            {/* Whom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="whom" className="font-semibold">
                  For Whom
                </Label>
                <Textarea
                  id="whom"
                  name="whom"
                  rows={6}
                  value={formData.whom}
                  onChange={handleInputChange}
                  className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3] resize-none"
                  placeholder="Describe the audience"
                />
              </div>
              <FileUpload field="whomImage" label="Audience Image" icon={Users} />
            </div>

            {/* Icon */}
            <div className="max-w-md">
              <FileUpload field="icon" label="Icon" icon={FileText} />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ServiceEdit;
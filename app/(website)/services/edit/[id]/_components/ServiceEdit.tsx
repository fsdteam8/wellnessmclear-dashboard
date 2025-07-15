/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Image, Users, Gift, Package, X, Loader2 } from "lucide-react";
import NextImage from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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

  // React Quill configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  }), []);

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
  ];

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
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: (data) => {
      window.location.href = "/services";
      queryClient.setQueryData(["service", serviceId], data);
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      
      setIsModified(false);
      
      setFileStates({
        overviewImage: null,
        receiveImage: null,
        whomImage: null,
        icon: null,
      });
      
      Object.values(previewUrls).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      
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
      await queryClient.cancelQueries({ queryKey: ["service", variables.serviceId] });
      const previousService = queryClient.getQueryData<ServiceResponse>(["service", variables.serviceId]);
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
      return { previousService };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field?: keyof typeof formData
  ) => {
    if (typeof e === "string" && field) {
      // Handle ReactQuill change
      setFormData((prev) => ({ ...prev, [field]: e }));
    } else if (typeof e !== "string") {
      // Handle input/textarea change
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setIsModified(true);
  };

  const handleFilePreview = (field: keyof PreviewUrls, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (previewUrls[field]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[field]!);
    }

    const url = URL.createObjectURL(file);
    
    setPreviewUrls((prev) => ({ ...prev, [field]: url }));
    setFileStates((prev) => ({ ...prev, [field]: file }));
    setIsModified(true);
  };

  const clearFilePreview = (field: keyof PreviewUrls) => {
    if (previewUrls[field]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[field]!);
    }
    
    const originalImage = serviceResponse?.data ? serviceResponse.data[field as keyof ServiceData] : null;
    
    setPreviewUrls((prev) => ({ 
      ...prev, 
      [field]: typeof originalImage === 'string' ? originalImage : null 
    }));
    setFileStates((prev) => ({ ...prev, [field]: null }));
    
    const input = document.getElementById(field) as HTMLInputElement;
    if (input) input.value = "";
    
    setIsModified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      token: session?.accessToken,
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
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-indigo-100 rounded-full">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{label}</h3>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <Input
            id={field}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFilePreview(field, e.target.files[0]);
              }
            }}
            className="w-full h-[70px] px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
            disabled={updateMutation.isPending}
          />
        </div>
        {previewUrls[field] && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {fileStates[field]?.name || "Current image"}
                </div>
                {fileStates[field] && (
                  <div className="text-xs text-gray-500">
                    {(fileStates[field]?.size / 1024)?.toFixed(1)} KB • {fileStates[field]?.type}
                  </div>
                )}
              </div>
              <Button
                onClick={() => clearFilePreview(field)}
                variant="outline"
                size="sm"
                className="ml-3 h-8 w-8 p-0 hover:bg-red-50 hover:border-red-red-200"
                disabled={updateMutation.isPending}
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            <div className="mt-4 w-full max-w-xs">
              <NextImage
                src={previewUrls[field]!}
                width={240}
                height={240}
                alt={`${label} preview`}
                className="mx-auto object-cover rounded-xl shadow-md"
                unoptimized={previewUrls[field]?.startsWith("blob:")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading service data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading service: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!serviceResponse?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No service data found</p>
          <Button
            onClick={() => refetch()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <form onSubmit={handleSubmit}>
          <Card className="">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">Edit Service</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Dashboard</span>
                    <span>›</span>
                    <span>Services</span>
                    <span>›</span>
                    <span className="text-emerald-600 font-semibold">Edit Service</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!isModified || updateMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Update Service"
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Service Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="title"
                        className="text-base font-semibold text-gray-700 mb-3 block"
                      >
                        Service Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter service title"
                        className="w-full h-[50px] px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        disabled={updateMutation.isPending}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="price"
                        className="text-base font-semibold text-gray-700 mb-3 block"
                      >
                        Price <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full h-[50px] px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        step="0.01"
                        min="0"
                        disabled={updateMutation.isPending}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Description</h3>
                  </div>
                  <div className="description-editor">
                    <ReactQuill
                      value={formData.description}
                      onChange={(value) => handleInputChange(value, "description")}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write a detailed service description..."
                      className="border-0 bg-gray-50/50 rounded-xl"
                      readOnly={updateMutation.isPending}
                    />
                  </div>
                </div>

                {/* Overview Section */}
                <div className="">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-orange-100 rounded-full">
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Overview</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label
                        htmlFor="overview"
                        className="text-base font-semibold text-gray-700 mb-3 block"
                      >
                        Overview Text
                      </Label>
                      <div className="description-editor">
                        <ReactQuill
                          value={formData.overview}
                          onChange={(value) => handleInputChange(value, "overview")}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Overview content"
                          className="border-0 bg-gray-50/50 rounded-xl"
                          readOnly={updateMutation.isPending}
                        />
                      </div>
                    </div>
                    <FileUpload
                      field="overviewImage"
                      label="Overview Image"
                      icon={Image}
                    />
                  </div>
                </div>

                {/* Receive Section */}
                <div className="">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Gift className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Receive Details</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label
                        htmlFor="receive"
                        className="text-base font-semibold text-gray-700 mb-3 block"
                      >
                        Receive Details
                      </Label>
                      <div className="description-editor">
                        <ReactQuill
                          value={formData.receive}
                          onChange={(value) => handleInputChange(value, "receive")}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="What users will receive"
                          className="border-0 bg-gray-50/50 rounded-xl"
                          readOnly={updateMutation.isPending}
                        />
                      </div>
                    </div>
                    <FileUpload
                      field="receiveImage"
                      label="Receive Image"
                      icon={Gift}
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div className="">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-pink-100 rounded-full">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Target Audience</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label
                        htmlFor="whom"
                        className="text-base font-semibold text-gray-700 mb-3 block"
                      >
                        For Whom
                      </Label>
                      <div className="description-editor">
                        <ReactQuill
                          value={formData.whom}
                          onChange={(value) => handleInputChange(value, "whom")}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Describe the audience"
                          className="border-0 bg-gray-50/50 rounded-xl"
                          readOnly={updateMutation.isPending}
                        />
                      </div>
                    </div>
                    <FileUpload
                      field="whomImage"
                      label="Audience Image"
                      icon={Users}
                    />
                  </div>
                </div>

                {/* Icon Upload */}
                <div className="">
                  <div className="max-w-md">
                    <FileUpload field="icon" label="Icon" icon={FileText} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      <style jsx global>{`
        .description-editor .ql-editor {
          min-height: 240px;
          font-size: 16px;
          line-height: 1.7;
          background-color: #f9fafb;
          border-radius: 0 0 0.75rem 0.75rem;
        }

        .description-editor .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 0.75rem 0.75rem 0 0;
          background-color: #ffffff;
        }

        .description-editor .ql-container {
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 0.75rem 0.75rem;
        }

        .description-editor .ql-editor:focus {
          outline: none;
        }

        .description-editor .ql-toolbar:hover {
          border-color: #10b981;
        }

        .description-editor .ql-container:hover {
          border-color: #10b981;
        }
      `}</style>
    </div>
  );
};

export default ServiceEdit;
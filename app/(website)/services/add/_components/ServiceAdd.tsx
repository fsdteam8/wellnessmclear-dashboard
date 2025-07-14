/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Image, Users, Gift, X } from "lucide-react";
import ImageComponent from "next/image";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { useRouter } from "next/navigation";

type FormDataType = {
  title: string;
  description: string;
  price: string;
  overview: string;
  overviewImage: File | null;
  receive: string;
  receiveImage: File | null;
  whom: string;
  whomImage: File | null;
  icon: File | null;
};

const ServiceAdd = () => {
  const session = useSession();
  const TOKEN = session?.data?.accessToken;
  const queryClient = useQueryClient();
  // const router = useRouter();

  // File input refs for clearing
  const fileInputRefs = useRef<{
    overviewImage: HTMLInputElement | null;
    receiveImage: HTMLInputElement | null;
    whomImage: HTMLInputElement | null;
    icon: HTMLInputElement | null;
  }>({
    overviewImage: null,
    receiveImage: null,
    whomImage: null,
    icon: null,
  });

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    price: "",
    overview: "",
    overviewImage: null,
    receive: "",
    receiveImage: null,
    whom: "",
    whomImage: null,
    icon: null,
  });

  const [previewUrls, setPreviewUrls] = useState<{
    overviewImage: string | null;
    receiveImage: string | null;
    whomImage: string | null;
    icon: string | null;
  }>({
    overviewImage: null,
    receiveImage: null,
    whomImage: null,
    icon: null,
  });

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const addService = useMutation({
    mutationFn: async (formData: FormDataType) => {
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("overview", formData.overview);
      formDataToSend.append("receive", formData.receive);
      formDataToSend.append("whom", formData.whom);

      // Append file fields (only if files exist)
      if (formData.overviewImage) {
        formDataToSend.append("overviewImage", formData.overviewImage);
      }
      if (formData.receiveImage) {
        formDataToSend.append("receiveImage", formData.receiveImage);
      }
      if (formData.whomImage) {
        formDataToSend.append("whomImage", formData.whomImage);
      }
      if (formData.icon) {
        formDataToSend.append("icon", formData.icon);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/service`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          body: formDataToSend,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
      window.location.href = "/services"
      
      // Cleanup URLs
      Object.values(previewUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        overview: "",
        overviewImage: null,
        receive: "",
        receiveImage: null,
        whom: "",
        whomImage: null,
        icon: null,
      });

      setPreviewUrls({
        overviewImage: null,
        receiveImage: null,
        whomImage: null,
        icon: null,
      });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleInputChange = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: keyof FormDataType, file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Cleanup previous URL if exists
    const urlField = field as keyof typeof previewUrls;
    if (previewUrls[urlField]) {
      URL.revokeObjectURL(previewUrls[urlField]!);
    }

    // Create new URL
    const url = URL.createObjectURL(file);

    // Update state immediately
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    setPreviewUrls((prev) => ({
      ...prev,
      [field]: url,
    }));
  };

  const clearFile = (field: keyof FormDataType) => {
    // Cleanup object URL
    const urlField = field as keyof typeof previewUrls;
    if (previewUrls[urlField]) {
      URL.revokeObjectURL(previewUrls[urlField]!);
    }

    // Update state immediately
    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
    
    setPreviewUrls((prev) => ({
      ...prev,
      [field]: null,
    }));

    // Clear the file input using ref
    if (fileInputRefs.current[urlField]) {
      fileInputRefs.current[urlField]!.value = "";
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.price.trim()) {
      toast.error("Please enter a price");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // Check if price is a valid number
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Submit the form
    addService.mutate(formData);
  };

  type FileUploadField = keyof typeof previewUrls;

  const FileUpload = ({
    field,
    label,
    accept = "image/*",
    icon: Icon,
  }: {
    field: FileUploadField;
    label: string;
    accept?: string;
    icon: React.ElementType;
  }) => (
    <div className="space-y-3">
      <Label
        htmlFor={field}
        className="flex items-center gap-2 text-base font-semibold"
      >
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={(el) => {
            fileInputRefs.current[field] = el;
          }}
          id={field}
          type="file"
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(field, e.target.files[0]);
            }
          }}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#A8C2A3] file:text-white hover:file:bg-[#96B091] h-[50px] border border-[#B6B6B6]"
        />

        {formData[field] && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {(formData[field] as File)?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {((formData[field] as File)?.size / 1024)?.toFixed(1)} KB •{" "}
                  {(formData[field] as File)?.type}
                </div>
              </div>
              <Button
                onClick={() => clearFile(field)}
                variant="outline"
                size="sm"
                className="ml-3 h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            {previewUrls[field] && (
              <div className="mt-3 w-full max-w-xs">
                <div className="relative w-full h-32 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
                  <ImageComponent
                    src={previewUrls[field] as string}
                    alt={`${label} preview`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAF9] min-h-screen">
      <Card className="">
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold leading-snug">Add Services</h2>
              <p className="text-sm text-gray-500">
                Dashboard &gt; Services &gt; Add service
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={addService.isPending}
              className="px-6 py-2 bg-[#76a36c] hover:bg-[#96B091] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addService.isPending ? "Publishing..." : "Publish"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-10">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold text-base">
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter service title"
                    className="h-[50px] border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-semibold text-base">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    className="h-[50px] border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Write the service description..."
                  rows={4}
                  className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                />
              </div>
            </div>

            {/* Overview Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="overview" className="font-semibold text-base">
                    Overview Text
                  </Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) =>
                      handleInputChange("overview", e.target.value)
                    }
                    placeholder="Overview content"
                    rows={6}
                    className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  />
                </div>
                <FileUpload
                  field="overviewImage"
                  label="Overview Image"
                  icon={Image}
                />
              </div>
            </div>

            {/* Receive Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="receive" className="font-semibold text-base">
                    Receive Details
                  </Label>
                  <Textarea
                    id="receive"
                    value={formData.receive}
                    onChange={(e) =>
                      handleInputChange("receive", e.target.value)
                    }
                    placeholder="What users will receive"
                    rows={6}
                    className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  />
                </div>
                <FileUpload
                  field="receiveImage"
                  label="Receive Image"
                  icon={Gift}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="whom" className="font-semibold text-base">
                    For Whom
                  </Label>
                  <Textarea
                    id="whom"
                    value={formData.whom}
                    onChange={(e) => handleInputChange("whom", e.target.value)}
                    placeholder="Describe the audience"
                    rows={6}
                    className="border border-[#B6B6B6] focus:border-[#A8C2A3] focus:ring-[#A8C2A3]"
                  />
                </div>
                <FileUpload
                  field="whomImage"
                  label="Audience Image"
                  icon={Users}
                />
              </div>
            </div>

            {/* Icon Upload */}
            <div className="space-y-6">
              <div className="max-w-md">
                <FileUpload field="icon" label="Icon" icon={FileText} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceAdd;
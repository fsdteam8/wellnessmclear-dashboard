
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Image, Users, Gift, Package, X } from "lucide-react";
import ImageComponent from "next/image";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
/* eslint-disable react-hooks/exhaustive-deps */
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
      window.location.href = "/services";

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

  const handleInputChange = (
    value: string | React.ChangeEvent<HTMLInputElement>,
    field: keyof FormDataType
  ) => {
    if (typeof value === "string") {
      // Handle ReactQuill input
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      // Handle regular input
      setFormData((prev) => ({
        ...prev,
        [field]: value.target.value,
      }));
    }
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
            className="w-full h-[70px] px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
            disabled={addService.isPending}
          />
        </div>
        {previewUrls[field] && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
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
            <div className="mt-4 w-full max-w-xs">
              <ImageComponent
                src={previewUrls[field] as string}
                width={240}
                height={240}
                alt={`${label} preview`}
                className="mx-auto object-cover rounded-xl shadow-md"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="">
      <div className="">
        <Card className="">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Add New Service</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>Dashboard</span>
                  <span>›</span>
                  <span>Services</span>
                  <span>›</span>
                  <span className="text-emerald-600 font-semibold">Add Service</span>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={addService.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {addService.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Publishing...
                  </span>
                ) : (
                  "Publish"
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
                      Service Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange(e, "title")}
                      placeholder="Enter service title"
                      className="w-full h-[50px] px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                      disabled={addService.isPending}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="price"
                      className="text-base font-semibold text-gray-700 mb-3 block"
                    >
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange(e, "price")}
                      placeholder="0.00"
                      className="w-full h-[50px] px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                      disabled={addService.isPending}
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
                    readOnly={addService.isPending}
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
                        readOnly={addService.isPending}
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
                        readOnly={addService.isPending}
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
                        readOnly={addService.isPending}
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

export default ServiceAdd;
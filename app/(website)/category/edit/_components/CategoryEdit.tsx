
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Image from "next/image";
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

interface CategoryData {
  _id: string;
  name: string;
  subCategories: { name: string }[];
  categoryImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: CategoryData;
}

export default function CategoryEdit() {
  const router = useRouter();
  const session = useSession();
  const params = useParams();
  const id = params?.id as string;
  const TOKEN = session?.data?.accessToken;

  const [formData, setFormData] = useState({
    name: "",
    subCategories: [] as { name: string }[],
    categoryImage: "",
    imageFile: null as File | null,
  });

  const [tagInput, setTagInput] = useState("");
  const [isRemovingTag, setIsRemovingTag] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ["category", id],
    queryFn: async (): Promise<ApiResponse> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
    enabled: !!id && !!TOKEN,
  });

  useEffect(() => {
    if (categoryData?.data) {
      setFormData({
        name: categoryData.data.name,
        subCategories: categoryData.data.subCategories,
        categoryImage: categoryData.data.categoryImage,
        imageFile: null,
      });
      setImagePreview(categoryData.data.categoryImage);
    }
  }, [categoryData]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }

      return response.json();
    },
    onSuccess: (success) => {
      toast.success(success.message || "Category updated successfully");
      router.push("/category");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.subCategories.some(tag => tag.name === trimmed)) {
      setFormData(prev => ({
        ...prev,
        subCategories: [...prev.subCategories, { name: trimmed }],
      }));
      setTagInput("");
    }
  };

  const handleInputBlur = () => {
    if (tagInput.trim() && !isRemovingTag) addTag();
    setIsRemovingTag(false);
  };

  const removeTag = (indexToRemove: number) => {
    setIsRemovingTag(true);
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload JPEG, PNG, or GIF image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setFormData(prev => ({ ...prev, imageFile: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    formData.subCategories.forEach((tag, i) => {
      data.append(`subCategories[${i}][name]`, tag.name);
    });
    if (formData.imageFile) {
      data.append("categoryImage", formData.imageFile);
    }

    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#EDEEF1] p-6">
        <div className="flex-1 flex justify-center items-center">
          <p className="text-lg">Loading category data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#EDEEF1] p-6">
        <div className="flex-1 flex justify-center items-center">
          <p className="text-lg text-red-500">Error loading category data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#EDEEF1] p-6">
      <div className="flex-1 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Category</h1>
          <p className="text-gray-500">Dashboard &gt; Category &gt; Edit</p>
        </div>

        <form onSubmit={handleSubmit} className="pt-10 space-y-6">

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column */}
            <div className="flex-1 space-y-16">
              {/* Category Name */}
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Type category name here..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-3 h-[50px] border border-[#707070]"
                />
              </div>

              {/* Sub Categories */}
              <div>
                <Label htmlFor="subCategories">Sub Categories</Label>
                <Input
                  id="subCategories"
                  placeholder="Type sub category and press Enter or comma..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={handleInputBlur}
                  className="mt-3 h-[50px] border border-[#707070]"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.subCategories.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="ml-2 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="w-full lg:w-1/3">
              <Label htmlFor="image">Category Image</Label>
              <div className="mt-3 space-y-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-[#707070]"
                />
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    width={300}
                    height={300}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-slate-600 hover:bg-slate-700"
            >
              <Save className="mr-2" size={18} />
              {mutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

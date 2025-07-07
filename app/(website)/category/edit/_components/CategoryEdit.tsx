"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

interface CategoryData {
  _id: string;
  name: string;
  subCategories: { name: string }[];
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
  });

  const [tagInput, setTagInput] = useState("");
  const [isRemovingTag, setIsRemovingTag] = useState(false);

  // Fetch single category data
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ["category", id],
    queryFn: async (): Promise<ApiResponse> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch category");
      }

      return res.json();
    },
    enabled: !!id && !!TOKEN, // Only run query when id and token are available
  });

  // Populate form data when category data is fetched
  useEffect(() => {
    if (categoryData?.data) {
      setFormData({
        name: categoryData.data.name,
        subCategories: categoryData.data.subCategories,
      });
    }
  }, [categoryData]);

  // Update category mutation
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(data),
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
    onError: (error) => {
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
    const trimmedValue = tagInput.trim();
    if (trimmedValue && !formData.subCategories.some(tag => tag.name === trimmedValue)) {
      setFormData(prev => ({
        ...prev,
        subCategories: [...prev.subCategories, { name: trimmedValue }]
      }));
      setTagInput("");
    }
  };

  const handleInputBlur = () => {
    // Only add tag if input is not empty and we're not removing a tag
    if (tagInput.trim() && !isRemovingTag) {
      addTag();
    }
    // Reset the removing tag flag
    setIsRemovingTag(false);
  };

  const removeTag = (indexToRemove: number) => {
    setIsRemovingTag(true);
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Log form data in the requested format
    console.log("Form Data Submitted:", formData);

    mutation.mutate(formData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#EDEEF1] p-6">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-lg">Loading category data...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-[#EDEEF1] p-6">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-red-500">Error loading category data</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#EDEEF1] p-6">
      <div className="flex-1 overflow-auto">
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Category</h1>
            <p className="text-gray-500">Dashboard &gt; Category &gt; Edit</p>
          </div>

          <div className="pt-10">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <Label htmlFor="subCategories">Sub Categories</Label>
                <div className="mt-3">
                  <Input
                    id="subCategories"
                    placeholder="Type sub category and press Enter or comma..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={handleInputBlur}
                    className="h-[50px] border border-[#707070]"
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
                          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                          className="ml-2 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <span className="mr-2"><Save /></span>
                  {mutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
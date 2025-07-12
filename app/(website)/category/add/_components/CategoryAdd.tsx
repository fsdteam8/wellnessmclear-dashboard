/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

export default function CategoryAdd() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      setToken(session?.accessToken ?? null);
    }
  }, [session, status]);

  const [formData, setFormData] = useState({
    name: "",
    subCategories: [] as { name: string }[],
    categoryImage: null as File | null,
  });

  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!token) throw new Error("Authentication token is missing");

      const body = new FormData();
      body.append("name", data.name);
      body.append("subCategories", JSON.stringify(data.subCategories));
      if (data.categoryImage) {
        body.append("categoryImage", data.categoryImage);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/category/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to create category");
      }

      return response.json();
    },
    onSuccess: (success) => {
      toast.success(success.message || "Category created successfully");
      router.push("/category");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create category");
    },
  });

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (
      trimmed &&
      !formData.subCategories.some((tag) => tag.name === trimmed)
    ) {
      setFormData((prev) => ({
        ...prev,
        subCategories: [...prev.subCategories, { name: trimmed }],
      }));
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!allowed.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, JPG, GIF)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, categoryImage: file }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, categoryImage: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-[#EDEEF1] p-6">
      <div className="flex-1 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add Category</h1>
          <p className="text-gray-500">Dashboard &gt; Category</p>
        </div>

        <form onSubmit={handleSubmit} className="pt-10 space-y-6">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Side */}
            <div className="flex-1 space-y-20">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Type category name here..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-3 h-[50px] border border-[#707070]"
                />
              </div>

              <div>
                <Label htmlFor="subCategories">Sub Categories</Label>
                <Input
                  id="subCategories"
                  placeholder="Type subcategory and press Enter or comma..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
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
                        className="ml-2 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Side */}
            <div className="w-full lg:w-1/3">
              <Label htmlFor="image">Category Image</Label>
              <div className="mt-3 space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="image"
                    className="flex items-center gap-2 px-4 py-2 border border-[#707070] rounded-md cursor-pointer hover:bg-gray-50 w-[300px]"
                  >
                    <Upload size={16} />
                    Choose Image
                    {formData.categoryImage && (
                    <span className="text-sm text-gray-600 truncate max-w-[120px]">
                      {formData.categoryImage.name}
                    </span>
                  )}
                  </Label>
                  
                </div>

                {imagePreview && (
                  <div className="relative w-[300px] mt-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={300}
                      height={300}
                      className="object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending || status !== "authenticated"}
              className="bg-slate-600 hover:bg-slate-700"
            >
              <Save className="mr-2" size={18} />
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

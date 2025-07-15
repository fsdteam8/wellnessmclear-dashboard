"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Save, X } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface BlogResponse {
  status: boolean;
  message: string;
  data: {
    title: string;
    description: string;
    thumbnail: string | null;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export default function BlogAdd() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const TOKEN = session?.accessToken;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "align",
    "color",
    "background",
    "link",
    "image",
  ];

  const createBlogMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/blog/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          body: data,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create blog");
      }

      return response.json() as Promise<BlogResponse>;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/blog-management");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Blog title is required");
      return;
    }

    const blogFormData = new FormData();
    blogFormData.append("title", formData.title);
    blogFormData.append("description", formData.description);
    if (thumbnail) {
      blogFormData.append("image", thumbnail);
    }

    createBlogMutation.mutate(blogFormData);
  };

  return (
    <div className="flex h-screen bg-[#EDEEF1]">
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Blog management
            </h1>
            <p className="text-gray-500">Dashboard &gt; Blog management</p>
          </div>
          <Button
            type="submit"
            form="blog-form"
            disabled={createBlogMutation.isPending}
            className="bg-[#A8C2A3] hover:bg-[#556d50]"
          >
            <Save className="mr-2 h-4 w-4" />
            {createBlogMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Blog Title</Label>
                <Input
                  id="title"
                  placeholder="Add your title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-3 border border-[#707070] h-[50px]"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <div className="mt-3 border border-[#707070] rounded-md overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your blog content here..."
                    className="min-h-[300px] overflow-y-scroll"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="p-6">
              <Label>Thumbnail</Label>
              <Card className="mt-3 shadow-none h-[410px] border border-[#707070]">
                <CardContent className="p-6 h-full">
                  {thumbnailPreview ? (
                    <div className="relative h-full">
                      <Image
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-full flex flex-col justify-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Upload thumbnail</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Click to browse files
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
  .ql-editor {
    min-height: 300px;
    max-height: 400px; /* You can adjust this height */
    overflow-y: auto;
    font-family: inherit;
    font-size: 16px;
  }

  .ql-toolbar {
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #707070 !important;
    background-color: #fafafa;
  }

  .ql-container {
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }

  .ql-snow .ql-tooltip {
    z-index: 1000;
  }
`}</style>

    </div>
  );
}

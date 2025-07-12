"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  savedPrice: string;
  image: File | null;
  category: string;
  subCategory: string[];
  brand: string;
  countInStock: string;
}

interface Category {
  _id: string;
  name: string;
}

interface CategoryResponse {
  status: boolean;
  message: string;
  data: Category[];
}

const ProductAddForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    actualPrice: "",
    discountedPrice: "",
    savedPrice: "",
    image: null,
    category: "",
    subCategory: [],
    brand: "",
    countInStock: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [tagInput, setTagInput] = useState("");

  const session = useSession();
  const token = session?.data?.accessToken;
  const reouter = useRouter()

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "actualPrice" || name === "discountedPrice") {
      const actual =
        name === "actualPrice"
          ? parseFloat(value)
          : parseFloat(formData.actualPrice);
      const discounted =
        name === "discountedPrice"
          ? parseFloat(value)
          : parseFloat(formData.discountedPrice);

      if (!isNaN(actual) && !isNaN(discounted) && actual >= discounted) {
        const saved = actual - discounted;
        setFormData((prev) => ({
          ...prev,
          savedPrice: saved.toFixed(2),
        }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Tag field handlers
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.subCategory.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        subCategory: [...prev.subCategory, trimmedTag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      subCategory: prev.subCategory.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "description",
      "actualPrice",
      "discountedPrice",
      "category",
      "brand",
      "countInStock",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
    }

    if (formData.subCategory.length === 0) {
      toast.error("Please add at least one subcategory");
      return false;
    }

    if (!formData.image) {
      toast.error("Please select a product image");
      return false;
    }

    const actualPrice = parseFloat(formData.actualPrice);
    const discountedPrice = parseFloat(formData.discountedPrice);
    const countInStock = parseInt(formData.countInStock);

    if (isNaN(actualPrice) || actualPrice <= 0) {
      toast.error("Enter a valid actual price");
      return false;
    }

    if (isNaN(discountedPrice) || discountedPrice <= 0) {
      toast.error("Enter a valid discounted price");
      return false;
    }

    if (discountedPrice > actualPrice) {
      toast.error("Discounted price cannot be more than actual price");
      return false;
    }

    if (isNaN(countInStock) || countInStock < 0) {
      toast.error("Enter a valid stock count");
      return false;
    }

    return true;
  };

  const { data: categoryData, isLoading: categoriesLoading } =
    useQuery<CategoryResponse>({
      queryKey: ["categories"],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/category/`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      },
      enabled: !!token,
    });

  const submitProductMutation = useMutation({
    mutationFn: async (productData: FormData) => {
      const formDataToSend = new FormData();
      Object.entries(productData).forEach(([key, val]) => {
        if (key === "subCategory") {
          formDataToSend.append(key, JSON.stringify(val));
        } else if (val !== null) {
          formDataToSend.append(key, val);
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formDataToSend,
        }
      );

      const response = await res.json();
      if (!res.ok) throw new Error(response.message || "Failed to add product");
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Product added successfully!");
      reouter.push('/products')
      setSubmitStatus({
        type: "success",
        message: response.message || "Product added successfully!",
      });
      setFormData({
        name: "",
        description: "",
        actualPrice: "",
        discountedPrice: "",
        savedPrice: "",
        image: null,
        category: "",
        subCategory: [],
        brand: "",
        countInStock: "",
      });
      setImagePreview(null);
      setTagInput("");
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setSubmitStatus({ type: "error", message: error.message });
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (!token) return toast.error("Please log in to add a product");
    setSubmitStatus({ type: null, message: "" });
    submitProductMutation.mutate(formData);
  };

  const categories = categoryData?.data || [];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add Product</h1>
          <p className="text-sm text-gray-500">Dashboard &gt; Product</p>
        </div>

        <div>
          <button
            onClick={handleSubmit}
            disabled={submitProductMutation.isPending || !token}
            className="bg-[#A8C2A3] hover:bg-[#4a6843] text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitProductMutation.isPending ? "Submitting..." : "Add Product"}
          </button>
        </div>
      </div>

      {submitStatus.type && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            submitStatus.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold block mb-2">
              Product Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Product name"
              className="input-style"
              disabled={submitProductMutation.isPending}
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Product description"
              className="input-style resize-none"
              disabled={submitProductMutation.isPending}
            />
          </div>

          <div className="rounded-lg">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Actual Price
                </label>
                <input
                  name="actualPrice"
                  type="number"
                  value={formData.actualPrice}
                  onChange={handleInputChange}
                  className="input-style"
                  disabled={submitProductMutation.isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Discounted Price
                </label>
                <input
                  name="discountedPrice"
                  type="number"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  className="input-style"
                  disabled={submitProductMutation.isPending}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  Saved Price
                </label>
                <input
                  name="savedPrice"
                  type="number"
                  value={formData.savedPrice}
                  className="input-style"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-10">
          <div>
            <label className="text-sm font-semibold block mb-2">
              Product Image
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div>
                  <Image
                    src={imagePreview}
                    width={300}
                    height={300}
                    alt="Preview"
                    className="mx-auto object-cover rounded-lg shadow"
                  />
                  <button
                    onClick={removeImage}
                    className="text-red-500 text-sm mt-2"
                    disabled={submitProductMutation.isPending}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mt-2">Click or drag file here</p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={submitProductMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-style bg-white"
              disabled={submitProductMutation.isPending || categoriesLoading}
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select category"}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shadcn Tag Field for Sub Category */}
          <div>
            <Label className="text-sm font-semibold block mb-2">
              Sub Category
            </Label>
            <div className="space-y-2">
              <Input
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type and press Enter or comma to add subcategory"
                className="w-full h-[49px]"
                disabled={submitProductMutation.isPending}
              />
              <div className="flex flex-wrap gap-2">
                {formData.subCategory.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      disabled={submitProductMutation.isPending}
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold block mb-2">
              Brand Name
            </Label>
            <input
              className="input-style"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="Brand"
              disabled={submitProductMutation.isPending}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold block mb-2">In Stock</Label>
            <input
              className="input-style"
              name="countInStock"
              type="number"
              value={formData.countInStock}
              onChange={handleInputChange}
              placeholder="Stock Count"
              min="0"
              disabled={submitProductMutation.isPending}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input-style:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ProductAddForm;

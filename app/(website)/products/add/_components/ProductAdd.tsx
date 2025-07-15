"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, DollarSign, Package, Tag, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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
  const router = useRouter();

  // React Quill configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block', 'link'
  ];

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

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
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
      router.push('/products');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Product</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Dashboard</span>
                <span>›</span>
                <span>Products</span>
                <span>›</span>
                <span className="text-emerald-600 font-medium">Add Product</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitProductMutation.isPending || !token}
              className="bg-[#82b478]  hover:bg-[#A8C2A3] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {submitProductMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {submitStatus.type && (
          <div
            className={`mb-8 p-6 rounded-xl border-l-4 ${
              submitStatus.type === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {submitStatus.type === "success" ? (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="font-medium">{submitStatus.message}</span>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Product Name */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Product Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Product Name
                  </Label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    disabled={submitProductMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Description</h3>
              </div>
              <div className="description-editor">
                <ReactQuill
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write a detailed product description..."
                  className="border-0"
                  readOnly={submitProductMutation.isPending}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Pricing</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Actual Price
                  </Label>
                  <input
                    name="actualPrice"
                    type="number"
                    value={formData.actualPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    disabled={submitProductMutation.isPending}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Discounted Price
                  </Label>
                  <input
                    name="discountedPrice"
                    type="number"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    disabled={submitProductMutation.isPending}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Saved Price
                  </Label>
                  <input
                    name="savedPrice"
                    type="number"
                    value={formData.savedPrice}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-gray-50 text-gray-600"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 mt-4">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Product Image</h3>
              </div>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors duration-200 bg-slate-50">
                {imagePreview ? (
                  <div className="space-y-4">
                    <Image
                      src={imagePreview}
                      width={200}
                      height={200}
                      alt="Preview"
                      className="mx-auto object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      disabled={submitProductMutation.isPending}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
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

            {/* Category */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Tag className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Category</h3>
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white"
                disabled={submitProductMutation.isPending || categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Tag className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Sub Categories</h3>
              </div>
              <div className="space-y-3">
                <Input
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type and press Enter or comma to add subcategory"
                  className="h-12 px-4 rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={submitProductMutation.isPending}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.subCategory.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                        disabled={submitProductMutation.isPending}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Brand</h3>
                </div>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Brand name"
                  disabled={submitProductMutation.isPending}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Package className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Stock</h3>
                </div>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  name="countInStock"
                  type="number"
                  value={formData.countInStock}
                  onChange={handleInputChange}
                  placeholder="Stock count"
                  min="0"
                  disabled={submitProductMutation.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .description-editor .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .description-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          border-radius: 0.75rem 0.75rem 0 0;
        }
        
        .description-editor .ql-container {
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
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

export default ProductAddForm;

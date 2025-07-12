"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Product {
  _id: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  savedPrice: number;
  image: string;
  category: string;
  subCategory: string | string[];
  brand: string;
  countInStock: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProductResponse {
  status: boolean;
  message: string;
  data: {
    product: Product;
    totalReviews: number;
  };
}

const ProductEditForm: React.FC = () => {
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
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [tagInput, setTagInput] = useState("");

  const session = useSession();
  const token = session?.data?.accessToken;
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params?.id;

  const router = useRouter()
  // Fetch single product
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useQuery<ProductResponse>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }

      return res.json();
    },
    enabled: !!token,
  });

  // Fetch categories
  const { data: categoryData, isLoading: categoriesLoading } =
    useQuery<CategoryResponse>({
      queryKey: ["categories"],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/category/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        return res.json();
      },
      enabled: !!token,
    });

  // Populate form with existing product data
  useEffect(() => {
    if (productData?.data?.product) {
      const product = productData.data.product;

      // Handle subcategory - it might be string or array
      let subCategoryArray: string[] = [];
      if (Array.isArray(product.subCategory)) {
        subCategoryArray = product.subCategory;
      } else if (typeof product.subCategory === "string") {
        // If it's a string, try to parse as JSON first, then split by comma
        try {
          subCategoryArray = JSON.parse(product.subCategory);
        } catch {
          subCategoryArray = product.subCategory
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);
        }
      }

      setFormData({
        name: product.name,
        description: product.description,
        actualPrice: product.actualPrice.toString(),
        discountedPrice: product.discountedPrice.toString(),
        savedPrice: product.savedPrice.toString(),
        image: null,
        category: product.category,
        subCategory: subCategoryArray,
        brand: product.brand,
        countInStock: product.countInStock.toString(),
      });
      setCurrentImage(product.image);
      setImagePreview(product.image);
    }
  }, [productData]);

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

    // Auto-calculate saved price
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
    setImagePreview(currentImage);
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

  const updateProductMutation = useMutation({
    mutationFn: async (productData: FormData) => {
      const formDataToSend = new FormData();

      formDataToSend.append("name", productData.name);
      formDataToSend.append("description", productData.description);
      formDataToSend.append("actualPrice", productData.actualPrice);
      formDataToSend.append("discountedPrice", productData.discountedPrice);
      formDataToSend.append("savedPrice", productData.savedPrice);
      formDataToSend.append("category", productData.category);
      formDataToSend.append(
        "subCategory",
        JSON.stringify(productData.subCategory)
      );
      formDataToSend.append("brand", productData.brand);
      formDataToSend.append("countInStock", productData.countInStock);

      if (productData.image) {
        formDataToSend.append("image", productData.image);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${id}`,
        {
          method: "PUT",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formDataToSend,
        }
      );

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.message || "Failed to update product");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Product updated successfully!");
      router.push("/products")
      setSubmitStatus({
        type: "success",
        message: response.message || "Product updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to update product",
      });
    },
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!token) {
      toast.error("Please log in to update the product");
      return;
    }

    setSubmitStatus({ type: null, message: "" });
    updateProductMutation.mutate(formData);
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  if (productError || !productData?.data?.product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-4">
            The product you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
        </div>
      </div>
    );
  }

  const categories = categoryData?.data || [];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="">
        <div className="flex justify-between items-center">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Product
              </h1>
            </div>
            <p className="text-gray-500">Dashboard &gt; Product &gt; Edit</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={updateProductMutation.isPending || !token}
              className="bg-[#A8C2A3] hover:bg-[#5b7756] text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </button>

            {!token && (
              <p className="text-sm text-red-500 mt-2 ml-4">
                Please log in to update the product
              </p>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              submitStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{submitStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product name"
                disabled={updateProductMutation.isPending}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product description"
                disabled={updateProductMutation.isPending}
              />
            </div>

            <div className="">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium mb-2 block">
                    Actual Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="actualPrice"
                    value={formData.actualPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100.00"
                    disabled={updateProductMutation.isPending}
                  />
                </div>

                <div>
                  <label className="text-base font-medium mb-2 block">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="80.00"
                    disabled={updateProductMutation.isPending}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-base font-medium mb-2 block">
                    Saved Price (Auto-calculated)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="savedPrice"
                    value={formData.savedPrice}
                    className="w-full px-4 py-3 border rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-10">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Product Image
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {imagePreview ? (
                  <div>
                    <Image
                      src={imagePreview}
                      width={160}
                      height={160}
                      alt="Product preview"
                      className="mx-auto h-40 w-40 object-cover rounded-lg shadow"
                    />
                    <div className="mt-2 space-x-2">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-red-500 text-sm hover:text-red-600"
                        disabled={updateProductMutation.isPending}
                      >
                        {formData.image
                          ? "Remove New Image"
                          : "Keep Current Image"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 mt-2">
                      Click or drag file here
                    </p>
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
                  disabled={updateProductMutation.isPending}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current image
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={updateProductMutation.isPending || categoriesLoading}
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((cat: Category) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ShadCN Tag Field for Sub Category */}
            <div>
              <Label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                Sub Category
              </Label>
              <div className="space-y-2">
                <Input
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type and press Enter or comma to add subcategory"
                  className="w-full h-[49px] rounded-lg"
                  disabled={updateProductMutation.isPending}
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
                        disabled={updateProductMutation.isPending}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-base font-semibold text-gray-700 mb-2 block">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Brand"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={updateProductMutation.isPending}
              />
            </div>

            <div>
              <label className="text-base font-semibold text-gray-700 mb-2 block">
                Stock Count
              </label>
              <input
                type="number"
                name="countInStock"
                value={formData.countInStock}
                onChange={handleInputChange}
                placeholder="Stock Count"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={updateProductMutation.isPending}
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditForm;

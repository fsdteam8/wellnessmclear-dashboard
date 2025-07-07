// "use client";

// import { useState } from "react";
// import {
//   Upload,
//   DollarSign,
//   Tag,
//   Box,
//   Building,
//   Loader2,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import Image from "next/image";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";

// interface FormData {
//   name: string;
//   description: string;
//   actualPrice: string;
//   discountedPrice: string;
//   savedPrice: string;
//   image: File | null;
//   category: string;
//   subCategory: string;
//   brand: string;
//   countInStock: string;
// }

// interface Category {
//   _id: string;
//   name: string;
// }

// interface CategoryResponse {
//   status: boolean;
//   message: string;
//   data: Category[];
// }

// const ProductAddForm = () => {
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     description: "",
//     actualPrice: "",
//     discountedPrice: "",
//     savedPrice: "",
//     image: null,
//     category: "",
//     subCategory: "",
//     brand: "",
//     countInStock: "",
//   });

//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [submitStatus, setSubmitStatus] = useState<{
//     type: 'success' | 'error' | null;
//     message: string;
//   }>({ type: null, message: '' });

//   const session = useSession();
//   const token = session?.data?.accessToken;

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Auto-calculate saved price
//     if (name === "actualPrice" || name === "discountedPrice") {
//       const actual =
//         name === "actualPrice"
//           ? parseFloat(value)
//           : parseFloat(formData.actualPrice);
//       const discounted =
//         name === "discountedPrice"
//           ? parseFloat(value)
//           : parseFloat(formData.discountedPrice);

//       if (!isNaN(actual) && !isNaN(discounted) && actual >= discounted) {
//         const saved = actual - discounted;
//         setFormData((prev) => ({
//           ...prev,
//           savedPrice: saved.toFixed(2),
//         }));
//       }
//     }
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
//     if (!validTypes.includes(file.type)) {
//       toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
//       return;
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error("File size must be less than 10MB");
//       return;
//     }

//     setFormData((prev) => ({ ...prev, image: file }));

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setImagePreview(e.target?.result as string);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeImage = () => {
//     setImagePreview(null);
//     setFormData((prev) => ({ ...prev, image: null }));
//     const fileInput = document.querySelector(
//       'input[type="file"]'
//     ) as HTMLInputElement;
//     if (fileInput) fileInput.value = "";
//   };

//   const validateForm = () => {
//     const requiredFields = [
//       "name",
//       "description",
//       "actualPrice",
//       "discountedPrice",
//       "category",
//       "subCategory",
//       "brand",
//       "countInStock",
//     ];

//     for (const field of requiredFields) {
//       if (!formData[field as keyof FormData]) {
//         toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1")}`);
//         return false;
//       }
//     }

//     if (!formData.image) {
//       toast.error("Please select a product image");
//       return false;
//     }

//     const actualPrice = parseFloat(formData.actualPrice);
//     const discountedPrice = parseFloat(formData.discountedPrice);
//     const countInStock = parseInt(formData.countInStock);

//     if (isNaN(actualPrice) || actualPrice <= 0) {
//       toast.error("Enter a valid actual price");
//       return false;
//     }

//     if (isNaN(discountedPrice) || discountedPrice <= 0) {
//       toast.error("Enter a valid discounted price");
//       return false;
//     }

//     if (discountedPrice > actualPrice) {
//       toast.error("Discounted price cannot be more than actual price");
//       return false;
//     }

//     if (isNaN(countInStock) || countInStock < 0) {
//       toast.error("Enter a valid stock count");
//       return false;
//     }

//     return true;
//   };

//   // Fetch categories
//   const { data: categoryData, isLoading: categoriesLoading } = useQuery<CategoryResponse>({
//     queryKey: ["categories"],
//     queryFn: async () => {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//       });

//       if (!res.ok) {
//         throw new Error("Failed to fetch categories");
//       }

//       return res.json();
//     },
//     enabled: !!token,
//   });

//   // Submit product mutation
//   const submitProductMutation = useMutation({
//     mutationFn: async (productData: FormData) => {
//       const formDataToSend = new FormData();
      
//       // Append all form fields
//       formDataToSend.append("name", productData.name);
//       formDataToSend.append("description", productData.description);
//       formDataToSend.append("actualPrice", productData.actualPrice);
//       formDataToSend.append("discountedPrice", productData.discountedPrice);
//       formDataToSend.append("savedPrice", productData.savedPrice);
//       formDataToSend.append("category", productData.category);
//       formDataToSend.append("subCategory", productData.subCategory);
//       formDataToSend.append("brand", productData.brand);
//       formDataToSend.append("countInStock", productData.countInStock);
      
//       // Append image if exists
//       if (productData.image) {
//         formDataToSend.append("image", productData.image);
//       }

//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`, {
//         method: "POST",
//         headers: {
//           ...(token && { Authorization: `Bearer ${token}` }),
//           // Don't set Content-Type for FormData, let the browser set it
//         },
//         body: formDataToSend,
//       });

//       const response = await res.json();

//       if (!res.ok) {
//         throw new Error(response.message || "Failed to add product");
//       }

//       return response;
//     },
//     onSuccess: (response) => {
//       toast.success(response.message || "Product added successfully!");
//       setSubmitStatus({ type: 'success', message: response.message || "Product added successfully!" });
      
//       // Reset form
//       setFormData({
//         name: "",
//         description: "",
//         actualPrice: "",
//         discountedPrice: "",
//         savedPrice: "",
//         image: null,
//         category: "",
//         subCategory: "",
//         brand: "",
//         countInStock: "",
//       });
//       setImagePreview(null);
      
//       // Clear file input
//       const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
//       if (fileInput) fileInput.value = "";
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "Failed to add product");
//       setSubmitStatus({ type: 'error', message: error.message || "Failed to add product" });
//     },
//   });

//   const handleSubmit = async () => {
//     if (!validateForm()) return;
    
//     if (!token) {
//       toast.error("Please log in to add a product");
//       return;
//     }

//     setSubmitStatus({ type: null, message: '' });
//     submitProductMutation.mutate(formData);
//   };

//   const categories = categoryData?.data || [];

//   return (
//     <div className="min-h-screen bg-white p-8">
//       <div className="">
//         <div className="mb-6">
//           <h1 className="text-2xl font-semibold text-gray-900">Add Product</h1>
//           <p className="text-gray-500">Dashboard &gt; Product</p>
//         </div>

//         {/* Status Messages */}
//         {submitStatus.type && (
//           <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
//             submitStatus.type === 'success' 
//               ? 'bg-green-50 border border-green-200 text-green-800' 
//               : 'bg-red-50 border border-red-200 text-red-800'
//           }`}>
//             {submitStatus.type === 'success' ? (
//               <CheckCircle className="h-5 w-5" />
//             ) : (
//               <AlertCircle className="h-5 w-5" />
//             )}
//             <span>{submitStatus.message}</span>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* LEFT SIDE */}
//           <div className="space-y-6">
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Tag className="h-4 w-4" />
//                 Product Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Product name"
//                 disabled={submitProductMutation.isPending}
//               />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Box className="h-4 w-4" />
//                 Description *
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 rows={4}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Product description"
//                 disabled={submitProductMutation.isPending}
//               />
//             </div>

//             <div className="bg-gray-50 p-6 rounded-lg">
//               <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
//                 <DollarSign className="h-5 w-5" />
//                 Pricing
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">
//                     Actual Price *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     name="actualPrice"
//                     value={formData.actualPrice}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="100.00"
//                     disabled={submitProductMutation.isPending}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium mb-2 block">
//                     Discounted Price *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     name="discountedPrice"
//                     value={formData.discountedPrice}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="80.00"
//                     disabled={submitProductMutation.isPending}
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label className="text-sm font-medium mb-2 block">
//                     Saved Price (Auto-calculated)
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     name="savedPrice"
//                     value={formData.savedPrice}
//                     className="w-full px-4 py-3 border rounded-lg bg-gray-100"
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="space-y-6">
//             <div>
//               <label className="text-sm font-semibold text-gray-700 mb-2 block">
//                 Product Image *
//               </label>
//               <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
//                 {imagePreview ? (
//                   <div>
//                     <Image
//                       src={imagePreview}
//                       width={160}
//                       height={160}
//                       alt="Product preview"
//                       className="mx-auto h-40 w-40 object-cover rounded-lg shadow"
//                     />
//                     <button
//                       type="button"
//                       onClick={removeImage}
//                       className="text-red-500 text-sm mt-2 hover:text-red-600"
//                       disabled={submitProductMutation.isPending}
//                     >
//                       Remove Image
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <p className="text-gray-600 mt-2">
//                       Click or drag file here
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       PNG, JPG, GIF up to 10MB
//                     </p>
//                   </>
//                 )}
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                   disabled={submitProductMutation.isPending}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Building className="h-4 w-4" />
//                 Category *
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={submitProductMutation.isPending || categoriesLoading}
//               >
//                 <option value="">
//                   {categoriesLoading ? "Loading categories..." : "Select a category"}
//                 </option>
//                 {categories.map((cat: Category) => (
//                   <option key={cat._id} value={cat._id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700 mb-2 block">
//                 Sub Category *
//               </label>
//               <input
//                 type="text"
//                 name="subCategory"
//                 value={formData.subCategory}
//                 onChange={handleInputChange}
//                 placeholder="Sub Category"
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={submitProductMutation.isPending}
//               />
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700 mb-2 block">
//                 Brand *
//               </label>
//               <input
//                 type="text"
//                 name="brand"
//                 value={formData.brand}
//                 onChange={handleInputChange}
//                 placeholder="Brand"
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={submitProductMutation.isPending}
//               />
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700 mb-2 block">
//                 Stock Count *
//               </label>
//               <input
//                 type="number"
//                 name="countInStock"
//                 value={formData.countInStock}
//                 onChange={handleInputChange}
//                 placeholder="Stock Count"
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={submitProductMutation.isPending}
//                 min="0"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="mt-8 flex justify-end">
//   <div>
//     <button
//       onClick={handleSubmit}
//       disabled={submitProductMutation.isPending || !token}
//       className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//     >
//       {submitProductMutation.isPending ? (
//         <>
//           <Loader2 className="h-4 w-4 animate-spin" />
//           Submitting...
//         </>
//       ) : (
//         "Add Product"
//       )}
//     </button>

//     {!token && (
//       <p className="text-sm text-red-500 mt-2 text-right">
//         Please log in to add a product
//       </p>
//     )}
//   </div>
// </div>

//       </div>
//     </div>
//   );
// };

// export default ProductAddForm;




"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface FormData {
  name: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  savedPrice: string;
  image: File | null;
  category: string;
  subCategory: string;
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
    subCategory: "",
    brand: "",
    countInStock: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const session = useSession();
  const token = session?.data?.accessToken;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "actualPrice" || name === "discountedPrice") {
      const actual =
        name === "actualPrice" ? parseFloat(value) : parseFloat(formData.actualPrice);
      const discounted =
        name === "discountedPrice" ? parseFloat(value) : parseFloat(formData.discountedPrice);

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
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const requiredFields = [
      "name", "description", "actualPrice", "discountedPrice",
      "category", "subCategory", "brand", "countInStock"
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
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

  const { data: categoryData, isLoading: categoriesLoading } = useQuery<CategoryResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: !!token,
  });

  const submitProductMutation = useMutation({
    mutationFn: async (productData: FormData) => {
      const formDataToSend = new FormData();
      Object.entries(productData).forEach(([key, val]) => {
        if (val !== null) formDataToSend.append(key, val);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataToSend,
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.message || "Failed to add product");
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Product added successfully!");
      setSubmitStatus({ type: 'success', message: response.message || "Product added successfully!" });
      setFormData({
        name: "", description: "", actualPrice: "", discountedPrice: "", savedPrice: "",
        image: null, category: "", subCategory: "", brand: "", countInStock: ""
      });
      setImagePreview(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setSubmitStatus({ type: 'error', message: error.message });
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (!token) return toast.error("Please log in to add a product");
    setSubmitStatus({ type: null, message: '' });
    submitProductMutation.mutate(formData);
  };

  const categories = categoryData?.data || [];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add Product</h1>
        <p className="text-gray-500">Dashboard &gt; Product</p>
      </div>

      {submitStatus.type && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${
          submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {submitStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold block mb-2">Product Name</label>
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
            <label className="text-sm font-semibold block mb-2">Description</label>
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

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Actual Price</label>
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
                <label className="text-sm font-medium mb-2 block">Discounted Price</label>
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
                <label className="text-sm font-medium mb-2 block">Saved Price</label>
                <input
                  name="savedPrice"
                  type="number"
                  value={formData.savedPrice}
                  className="input-style bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold block mb-2">Product Image</label>
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
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
              className="input-style"
              disabled={submitProductMutation.isPending || categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select category"}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <input className="input-style" name="subCategory" value={formData.subCategory} onChange={handleInputChange} placeholder="Sub Category" />
          <input className="input-style" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Brand" />
          <input className="input-style" name="countInStock" type="number" value={formData.countInStock} onChange={handleInputChange} placeholder="Stock Count" min="0" />
        </div>
      </div>

      <div className="mt-8 text-right">
        <button
          onClick={handleSubmit}
          disabled={submitProductMutation.isPending || !token}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
        >
          {submitProductMutation.isPending ? "Submitting..." : "Add Product"}
        </button>
        {!token && <p className="text-sm text-red-500 mt-2">Please log in to add a product</p>}
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

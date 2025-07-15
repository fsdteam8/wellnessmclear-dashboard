"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";

interface Product {
  _id: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  savedPrice: number;
  image: string;
  category: string;
  subCategory: string;
  brand: string;
  countInStock: number;
  createdAt: string;
  updatedAt: string;
  avgRating: number | null;
  totalReviews: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

interface Column {
  key: keyof Product | string;
  label: string;
  render?: (value: unknown, row: Product) => React.ReactNode;
}

const columns: Column[] = [
  {
    key: "name",
    label: "Product Name",
    render: (value) => (
      <h1 className="text-black px-4 py-2 cursor-pointer max-w-[200px]">
        {(value as string).slice(0, 25)}
      </h1>
    ),
  },
  {
    key: "discountedPrice",
    label: "DiscountedPrice",
    render: (value) => (
      <div className="max-w-[200px] text-sm text-black">
        ${(value as number).toFixed(2)}
      </div>
    ),
  },
  {
    key: "actualPrice",
    label: "Actual Price",
    render: (value) => (
      <div className="font-medium text-gray-800">
        ${(value as number).toFixed(2)}
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Date",
    render: (value) =>
      new Date(value as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const session = useSession();
  const TOKEN = session?.data?.accessToken;
  const queryClient = useQueryClient();

  const { data: apiResponse, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["products-data", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch products data");
      }
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: Product) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${product._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete product");
      }

      return product._id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-data", currentPage] });
      toast.success("Product deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      toast.error(error.message);
    },
  });

  const products = apiResponse?.data?.products || [];
  const pagination = apiResponse?.data?.pagination;
  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const isEmpty = !isLoading && !isError && totalItems === 0;

  const handleAddProduct = () => {
    router.push("/products/add");
  };

  const handleEdit = (product: Product) => {
    router.push(`/products/edit/${product._id}`);
  };

  const handleDelete = async (product: Product) => {
    
      try {
        await deleteMutation.mutateAsync(product);
        console.log("Product deleted successfully:", product.name);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="p-6 bg-[#EDEEF1]">
          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddProduct}
              title="Products List"
              buttonText="Create Product"
            />
            <p className="text-gray-500 -mt-4">
              Dashboard &gt; Products_List
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <PuffLoader
                color="rgba(49, 23, 215, 1)"
                loading
                speedMultiplier={1}
              />
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center font-medium">
              Failed to load data. Please try again later.
            </div>
          ) : isEmpty ? (
            <div className="text-gray-500 text-center font-medium">
              No products found.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

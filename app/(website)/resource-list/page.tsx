"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import Image from "next/image";
import type { Product } from "@/type/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";

// Interfaces
interface ApiResourceRequest {
  _id: string;
  title: string;
  country: string;
  states: string[];
  resourceType: string[];
  description: string;
  price: number;
  discountPrice: number;
  quantity: number;
  format: string;
  file: {
    url: string | null;
    type: string | null;
  };
  thumbnail: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
  };
  status: string;
  practiceAreas: string[];
  productId: string;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
}

interface ApiResponse {
  success: boolean;
  data: ApiResourceRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
}

interface ExtendedProduct extends Product {
  originalId: string;
}

// Fetch resources with pagination
const fetchResources = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/get-all-resources?page=${page}&limit=${limit}&status=approved`
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(errorData.message || "Failed to fetch resources");
  }

  return response.json();
};

// ✅ Fixed DELETE resource function
const deleteResource = async (
  resourceId: string,
  token: string
): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/${resourceId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let result: { success: boolean; message?: string } = { success: true };

  try {
    const text = await response.text();
    if (text) {
      result = JSON.parse(text);
    }
  } catch (err) {
    console.warn("Failed to parse JSON from delete response:", err);
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Failed to delete resource");
  }
};

// Transform API data to table format
const transformResourceData = (
  resources: ApiResourceRequest[]
): ExtendedProduct[] => {
  return resources.map(
    (resource: ApiResourceRequest): ExtendedProduct => ({
      id: Number(resource._id) || 0,
      originalId: resource._id,
      name: resource.title,
      price: `$${resource.price}`,
      discountPrice: `$${resource.discountPrice}`,
      quantity: resource.quantity,
      format: resource.format,
      date:
        new Date(resource.createdAt).toLocaleDateString() +
        "\n" +
        new Date(resource.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      thumbnail: resource.thumbnail || "/placeholder.svg?height=40&width=40",
    })
  );
};

// Column definitions
const columns = [
  {
    key: "name",
    label: "Resource Name",
    render: (value: string, row: ExtendedProduct) => (
      <div className="flex items-center space-x-3">
        <Image
          src={row.thumbnail || "/placeholder.svg?height=40&width=40"}
          alt="Resource thumbnail"
          width={40}
          height={40}
          className="rounded object-cover"
        />
        <span className="max-w-xs truncate font-medium">{value}</span>
      </div>
    ),
  },
  { key: "originalId", label: "Id" },
  { key: "price", label: "Price" },
  { key: "discountPrice", label: "Discount Price" },
  { key: "quantity", label: "Quantity" },
  { key: "format", label: "Format" },
  {
    key: "date",
    label: "Date",
    render: (value: string) => (
      <div className="whitespace-pre-line text-sm">{value}</div>
    ),
  },
];

export default function ResourceListPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const session = useSession();
  const queryClient = useQueryClient();

  const TOKEN = session?.data?.accessToken || "";

  const {
    data: resourcesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["resources", "approved", currentPage, itemsPerPage],
    queryFn: () => fetchResources(currentPage, itemsPerPage),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (resourceId: string) => deleteResource(resourceId, TOKEN),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["resources", "approved"] });

      const previousData = queryClient.getQueryData([
        "resources",
        "approved",
        currentPage,
        itemsPerPage,
      ]);

      queryClient.setQueryData(
        ["resources", "approved", currentPage, itemsPerPage],
        (old: ApiResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item._id !== deletedId),
            pagination: {
              ...old.pagination,
              totalItems: old.pagination.totalItems - 1,
            },
          };
        }
      );

      return { previousData };
    },
    onError: (err) => {
      toast.error(`${(err as Error).message || "Failed to delete resource"}`);
      console.log("Delete failed:", err);
    },
    onSuccess: () => {
      toast.success("Delete successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", "approved"] });
    },
  });

  const handleAddResource = () => {
    router.push("/resource-list/add");
  };

  const handleEdit = (resource: ExtendedProduct) => {
    router.push(`/resource-list/edit/${resource.originalId}`);
  };

  const handleDelete = (resource: ExtendedProduct) => {
    deleteMutation.mutate(resource.originalId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableData = resourcesResponse?.data
    ? transformResourceData(resourcesResponse.data)
    : [];
  const pagination = resourcesResponse?.pagination;

  const isEmpty = (arr: ExtendedProduct[]) => !arr || arr.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-10">
          <PageHeader
            onButtonClick={handleAddResource}
            title="Resource List"
            buttonText="Add Resource"
          />
          <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <PuffLoader
            color="rgba(49, 23, 215, 1)"
            loading
            speedMultiplier={1}
            size={60}
          />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-10">
          <PageHeader
            onButtonClick={handleAddResource}
            title="Resource List"
            buttonText="Add Resource"
          />
          <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
        </div>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-lg text-red-600 text-center">
            Error loading resources:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-10">
        <PageHeader
          onButtonClick={handleAddResource}
          title="Resource List"
          buttonText="Add Resource"
        />
        <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
      </div>

      {isEmpty(tableData) ? (
        <div className="text-center text-gray-500 mt-20 text-lg">
          No resources found.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          currentPage={pagination?.currentPage || 1}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.totalItems || 0}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

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
  price: number;
  discountPrice: number;
  quantity: number;
  overview: string;
  whomImage: string;
  createdAt: string;
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
}

interface ExtendedProduct extends Product {
  originalId: string;
}

// API Functions
const fetchResources = async (page = 1, limit = 10): Promise<ApiResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/service?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Network error" }));
    throw new Error(errorData.message || "Failed to fetch resources");
  }

  return response.json();
};

const deleteResource = async (serviceId: string, token: string): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/service/${serviceId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Delete failed" }));
    throw new Error(errorData.message || "Failed to delete resource");
  }


};

// Transform API data to table format
const transformResourceData = (resources: ApiResourceRequest[]): ExtendedProduct[] => {
  return resources.map((resource) => ({
    id: Number(resource._id) || 0,
    originalId: resource._id,
    name: resource.title,
    price: `$${resource.price}`,
    discountPrice: `$${resource.discountPrice}`,
    quantity: resource.quantity,
    format: resource.overview,
    date: new Date(resource.createdAt).toLocaleDateString() + "\n" + 
          new Date(resource.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
    thumbnail: resource.whomImage || "/placeholder.svg?height=40&width=40",
  }));
};

// Column definitions
const columns = [
  {
    key: "name",
    label: "Resource Name",
    render: (value: string, row: ExtendedProduct) => (
      <div className="flex items-center space-x-3">
        <Image
          src={row.thumbnail}
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
  // { key: "format", label: "Format" },
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
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const TOKEN = session?.accessToken || "";

  // Fetch resources query
  const {
    data: resourcesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["services", currentPage, itemsPerPage],
    queryFn: () => fetchResources(currentPage, itemsPerPage),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Delete mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => deleteResource(serviceId, TOKEN),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["services", currentPage, itemsPerPage] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<ApiResponse>([
        "services",
        currentPage,
        itemsPerPage,
      ]);

      // Optimistically update the cache
      queryClient.setQueryData(["services", currentPage, itemsPerPage], (old?: ApiResponse) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((item) => item._id !== deletedId),
          pagination: {
            ...old.pagination,
            totalItems: Math.max(0, old.pagination.totalItems - 1),
          },
        };
      });

      return { previousData };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["services", currentPage, itemsPerPage], context.previousData);
      }
      toast.error(`Failed to delete resource: ${(err as Error).message}`);
    },
    onSuccess: () => {
      window.location.href = "/services"
      toast.success("Resource deleted successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // Event handlers
  const handleAddResource = () => {
    router.push("/services/add");
  };

  const handleEdit = (resource: ExtendedProduct) => {
    router.push(`/services/edit/${resource.originalId}`);
  };

  const handleDelete = (resource: ExtendedProduct) => {
    deleteMutation.mutate(resource.originalId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Prepare data for table
  const tableData = resourcesResponse?.data ? transformResourceData(resourcesResponse.data) : [];
  const pagination = resourcesResponse?.pagination;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-10">
          <PageHeader
            onButtonClick={handleAddResource}
            title="Services List"
            buttonText="Add Service"
          />
          <p className="text-gray-500 -mt-4">Dashboard &gt; Services List</p>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <PuffLoader color="rgba(49, 23, 215, 1)" loading size={60} />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-10">
          <PageHeader
            onButtonClick={handleAddResource}
            title="Services List"
            buttonText="Add Service"
          />
          <p className="text-gray-500 -mt-4">Dashboard &gt; services List</p>
        </div>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-lg text-red-600 text-center">
            Error loading resources: {error instanceof Error ? error.message : "Unknown error"}
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
          title="Services List"
          buttonText="Add Service"
        />
        <p className="text-gray-500 -mt-4">Dashboard &gt; Services List</p>
      </div>

      {tableData.length === 0 ? (
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
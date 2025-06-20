"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import Image from "next/image";
import type { Product } from "@/type/types";
import { toast } from "sonner";
import { PuffLoader } from "react-spinners";

// Interface to match API response
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
  message?: string;
}

// Extended Product interface to include original _id
interface ExtendedProduct extends Product {
  originalId: string; // Store the original _id for API operations
}

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODNlZDVlYTY0ODUxNzk2MWZlYmQ2OGQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk4ODkzNzgsImV4cCI6MTc1MDQ5NDE3OH0.GkczutuRZ01PJuoWkHzoLx2PB_gBDkEGAfMyiN7-4XI";
// Get auth token from environment or auth context

// Fetch function for TanStack Query
const fetchResources = async (): Promise<ExtendedProduct[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/get-all-resources`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch resources");
  }

  // Filter only approved resources and transform to match Product interface
  const approvedResources = data.data
    .filter((resource: ApiResourceRequest) => resource.status === "approved")
    .map(
      (resource: ApiResourceRequest): ExtendedProduct => ({
        id: Number(resource._id) || 0, // Convert _id to number for Product interface
        originalId: resource._id, // Keep original _id for API operations
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

  return approvedResources;
};

// Delete function for TanStack Query
const deleteResource = async (resourceId: string): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/${resourceId}`,
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
    throw new Error(errorData.message || "Failed to delete resource");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to delete resource");
  }
};

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
  // {
  //   key: "id",
  //   label: "ID",
  //   render: (value: string) => <span className="font-mono text-base text-gray-600">{value}</span>,
  // },
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
  const itemsPerPage = 9;

  // TanStack Query to fetch resources
  const {
    data: resources = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["resources", "approved"],
    queryFn: fetchResources,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onMutate: async (resourceId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["resources", "approved"] });

      // Snapshot the previous value
      const previousResources = queryClient.getQueryData<ExtendedProduct[]>([
        "resources",
        "approved",
      ]);

      // Optimistically update - remove the item from the list
      queryClient.setQueryData<ExtendedProduct[]>(
        ["resources", "approved"],
        (old) =>
          old?.filter((resource) => resource.originalId !== resourceId) || []
      );

      // Return a context object with the snapshotted value
      return { previousResources };
    },
    onError: (err, resourceId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousResources) {
        queryClient.setQueryData(
          ["resources", "approved"],
          context.previousResources
        );
      }

      toast.error("Delete Failed", {
        description:
          err instanceof Error ? err.message : "Failed to delete resource",
      });
    },
    onSuccess: () => {
      toast.success("Resource Deleted", {
        description: "The resource has been successfully deleted.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["resources", "approved"] });
    },
  });

  const totalItems = resources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleAddResource = () => {
    router.push("/resource-list/add");
  };

  const handleEdit = (resource: ExtendedProduct) => {
    router.push(`/resource-list/edit/${resource.originalId}`);
  };

  const handleDelete = (resource: ExtendedProduct) => {
    if (window.confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      deleteMutation.mutate(resource.originalId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[100vh] bg-gray-50">
        <div className="text-center">
          <PuffLoader
            color="rgba(49, 23, 215, 1)"
            loading
            speedMultiplier={1}
            size={60} // You can adjust size
          />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddResource}
              title="Resource List"
              buttonText="Add Resource"
            />
            <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
          </div>

          <DataTable
            columns={columns}
            data={resources}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}

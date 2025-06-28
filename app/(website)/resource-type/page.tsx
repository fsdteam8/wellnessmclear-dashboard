"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";

interface ResourceType {
  _id: string;
  resourceTypeName: string;
  description: string;
  createdAt: string;
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

interface Column {
  key: keyof ResourceType;
  label: string;
  render?: (value: unknown, row: ResourceType) => React.ReactNode;
}

const columns: Column[] = [
  {
    key: "resourceTypeName",
    label: "Name",
    render: (value) => (
      <Badge
        variant="secondary"
        className="bg-slate-600 text-white px-4 py-2 cursor-pointer hover:bg-slate-500 transition-colors w-[200px]"
      >
        {(value as string)?.slice(0, 20)}
      </Badge>
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
  {
    key: "description",
    label: "Description",
  },
];

export default function ResourceTypePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const session = useSession();
  const TOKEN = session?.data?.accessToken;

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ResourceType[]>({
    queryKey: ["resource-data"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource-type/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch resource type data");
      }
      const json = await res.json();
      return json.data as ResourceType[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (resource: ResourceType) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource-type/${resource._id}`,
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
        throw new Error(errorData.message || "Failed to delete resource type");
      }

      return resource._id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-data"] });
      toast.success("Resource type deleted successfully!");
    },
    onError: (error: Error) => {
      console.error("Delete failed:", error);
      toast.error(error.message);
    },
  });

  const totalItems = data?.length ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isEmpty = !isLoading && !isError && totalItems === 0;

  const handleAddResource = () => {
    router.push("/resource-type/add");
  };

  const handleEdit = (resource: ResourceType) => {
    router.push(`/resource-type/edit/${resource._id}`);
  };

  const handleDelete = async (resource: ResourceType) => {
    try {
      await deleteMutation.mutateAsync(resource);
      console.log("Deleted:", resource.resourceTypeName);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="p-6 bg-[#EDEEF1] min-h-screen">
        <div className="mb-10">
          <PageHeader
            onButtonClick={handleAddResource}
            title="Resource Types List"
            buttonText="Add Resource Type"
          />
          <p className="text-gray-500 -mt-4">Dashboard &gt; Resource_Types_List</p>
        </div>

        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center bg-gray-50">
            <PuffLoader
              color="rgba(49, 23, 215, 1)"
              cssOverride={{}}
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
            No resource types found.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={currentData || []}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

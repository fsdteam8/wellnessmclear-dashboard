"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {  PuffLoader } from "react-spinners";

interface PracticeArea {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

interface Column {
  key: keyof PracticeArea;
  label: string;
  render?: (value: unknown, row: PracticeArea) => React.ReactNode;
}

const columns: Column[] = [
  {
    key: "name",
    label: "Name",
    render: (value) => (
      // <Link href={`/practice-area/${row._id}`} passHref>
      <Badge
        variant="secondary"
        className="bg-slate-600 text-white px-4 py-2 cursor-pointer hover:bg-slate-500 transition-colors w-[200px]"
      >
        {(value as string).slice(0, 20)}
      </Badge>
      // </Link>
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

export default function CategoriesPage() {
  const router = useRouter();
  // const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const session = useSession();
  console.log("session", session);

  const TOKEN = session?.data?.accessToken;

  // Set up query client for cache invalidation
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PracticeArea[]>({
    queryKey: ["practice-data"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/practice-area/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch practice area data");
      }
      const json = await res.json();
      return json.data as PracticeArea[];
    },
  });

  console.log("data", data);
  // Set up delete mutation with TanStack Query
  const deleteMutation = useMutation({
    mutationFn: async (practiceArea: PracticeArea) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/practice-area/${practiceArea._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete practice area");
      }

      return practiceArea._id;
    },
    onSuccess: () => {
      // Invalidate and refetch the data after successful deletion
      queryClient.invalidateQueries({ queryKey: ["practice-data"] });

      // toast({
      //   title: "Success",
      //   description: `Practice area "${deletedPracticeArea.name}" deleted successfully`,
      // });
      toast.success("Practice area  deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      // toast({
      //   title: "Error",
      //   description: `Failed to delete practice area "${deletedPracticeArea.name}". ${error.message}`,
      //   variant: "destructive",
      // });
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

  const handleAddCategory = () => {
    router.push("/practice-area/add");
  };

  const handleEdit = (category: PracticeArea) => {
    router.push(`/practice-area/edit/${category._id}`);
  };

  const handleDelete = async (category: PracticeArea) => {
    try {
      await deleteMutation.mutateAsync(category);
      console.log("Practice area deleted successfully:", category.name);
    } catch (error) {
      console.error("Failed to delete practice area:", error);
      // Error is already handled in the mutation's onError callback
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-[#EDEEF1]">
          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddCategory}
              title="Practice Areas List"
              buttonText="Add Practice Area"
            />
            <p className="text-gray-500 -mt-4">
              Dashboard &gt; Practice_Areas_List
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-[60vh] items-center justify-center bg-gray-50">
              <div className="text-center">
                {/* Optional: Remove this if you only want MoonLoader */}
                {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div> */}
                <PuffLoader
                  color="rgba(49, 23, 215, 1)"
                  cssOverride={{}}
                  loading
                  speedMultiplier={1}
                />
              </div>
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center font-medium">
              Failed to load data. Please try again later.
            </div>
          ) : isEmpty ? (
            <div className="text-gray-500 text-center font-medium">
              No practice areas found.
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
    </div>
  );
}

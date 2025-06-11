"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface PracticeArea {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
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
    render: (value, row) => (
      <Link href={`/categories/${row._id}`} passHref>
        <Badge
          variant="secondary"
          className="bg-slate-600 text-white px-4 py-2 cursor-pointer hover:bg-slate-500 transition-colors"
        >
          {value as string}
        </Badge>
      </Link>
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
    label: "List Of Sub_categories",
  },
];

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const {
    data,
    isLoading,
    isError,
  } = useQuery<PracticeArea[]>({
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

  const totalItems = data?.length ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isEmpty = !isLoading && !isError && totalItems === 0;

  const handleAddCategory = () => {
    router.push("/categories/add");
  };

  const handleEdit = (category: PracticeArea) => {
    router.push(`/categories/edit/${category._id}`);
  };

  const handleDelete = async (category: PracticeArea) => {
    if (
      confirm(
        `Are you sure you want to delete the category "${category.name}"? This will also delete all subcategories.`
      )
    ) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delete
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        // Use queryClient.invalidateQueries if needed
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-[#EDEEF1]">
          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddCategory}
              title="Practice Areas"
              buttonText="Add Practice Area"
            />
            <p className="text-gray-500 -mt-4">Dashboard &gt; Practice_Areas</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="text-gray-500 text-center font-medium">
                Loading...
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
            />
          )}
        </div>
      </div>
    </div>
  );
}

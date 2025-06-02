"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { Breadcrumb } from "@/components/breadcrumb"
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast"; // Import useToast

const mockCodes = [
  {
    id: 1,
    code: "JEOFO23",
    discount: "$2",
    startDate: "03/05/25",
    endDate: "20/05/25",
    status: "Active",
  },
  {
    id: 2,
    code: "JEOFO23",
    discount: "$3",
    startDate: "03/05/25",
    endDate: "20/05/25",
    status: "Active",
  },
  {
    id: 3,
    code: "BKOFO24",
    discount: "$3",
    startDate: "15/05/25",
    endDate: "20/06/25",
    status: "Schedule",
  },
  {
    id: 4,
    code: "JEOFO23",
    discount: "$2",
    startDate: "03/05/25",
    endDate: "20/05/25",
    status: "Active",
  },
  {
    id: 5,
    code: "JEOFO23",
    discount: "$3",
    startDate: "03/05/25",
    endDate: "20/05/25",
    status: "Active",
  },
  {
    id: 6,
    code: "JEOFO23",
    discount: "$0.50",
    startDate: "03/05/25",
    endDate: "20/05/25",
    status: "Active",
  },
  {
    id: 7,
    code: "BKOFO24",
    discount: "$2",
    startDate: "15/05/25",
    endDate: "20/06/25",
    status: "Schedule",
  },
  {
    id: 8,
    code: "BKOFO24",
    discount: "$0.50",
    startDate: "15/05/25",
    endDate: "20/06/25",
    status: "Schedule",
  },
  {
    id: 9,
    code: "BKOFO24",
    discount: "$2",
    startDate: "15/05/25",
    endDate: "20/06/25",
    status: "Schedule",
  },
  {
    id: 10,
    code: "BKOFO24",
    discount: "$0.50",
    startDate: "15/05/25",
    endDate: "20/06/25",
    status: "Schedule",
  },
];

const columns = [
  { key: "code", label: "Code ID" },
  { key: "discount", label: "Discount price" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <Badge
        variant={value === "Active" ? "default" : "secondary"}
        className={
          value === "Active"
            ? "bg-[#008000] text-white border border-green-200"
            : value === "Schedule"
            ? "bg-[#FFA300] text-white border border-yellow-200"
            : "bg-gray-100 text-gray-700 border border-gray-200"
        }
      >
        {value}
      </Badge>
    ),
  },
];

export default function PromoCodePage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialize useToast
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = mockCodes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleAddCode = () => {
    router.push("/promo-code/add");
  };

  type PromoCode = {
    id: number;
    code: string;
    discount: string;
    startDate: string;
    endDate: string;
    status: string;
  };

  const handleEdit = (code: PromoCode) => {
    router.push(`/promo-code/edit/${code.id}`);
  };

  const handleDelete = async (code: PromoCode) => {
    // Simulate API call for deletion
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      // Remove item from mockCodes (in a real app, you'd refetch or update state from API response)
      // For now, just show a success toast
      toast({
        title: "Success",
        description: `Promo code "${code.code}" deleted successfully.`,
      });
      // Here you would typically refetch your data or update your local state
      // For this example, we'll assume the parent component handles data refetching
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete promo code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Promo Code" }, { label: "Code List" }]} /> */}

          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddCode}
              title="Code List"
              buttonText="Add Code"
            />
            <p className="text-gray-500 -mt-4">
              Dashboard &gt; Code &gt; Code List{" "}
            </p>
          </div>
          {/* <PageHeader title="Code List" buttonText="Add Code" onButtonClick={handleAddCode} /> */}

          <DataTable
            columns={columns}
            data={mockCodes}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

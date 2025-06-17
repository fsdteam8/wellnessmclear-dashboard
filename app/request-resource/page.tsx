"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
// import { useToast } from "@/hooks/use-toast"
import Image from "next/image";
import type { ResourceRequest, ResourceColumn, Seller } from "@/type/types";
import { toast } from "sonner";

// Updated interfaces to match API response
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
/* eslint-disable react-hooks/exhaustive-deps */
export default function RequestResourcePage() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  //   const { toast } = useToast()

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/get-all-resources`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();

      if (data.success) {
        // Filter only pending resources and transform to match your existing structure
        const pendingResources = data.data
          .filter(
            (resource: ApiResourceRequest) => resource.status === "pending"
          )
          .map((resource: ApiResourceRequest) => ({
            id: resource.productId,
            name: resource.title,
            seller: {
              name: `${resource.createdBy.firstName} ${resource.createdBy.lastName}`,
              avatar:
                resource.createdBy.profileImage ||
                "/placeholder.svg?height=32&width=32",
            },
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
            thumbnail:
              resource.thumbnail || "/placeholder.svg?height=40&width=40",
            statuses: ["pending"],
            _id: resource._id,
          }));

        setRequests(pendingResources);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to fetch resources", {
        description: "Something went wrong while fetching data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (resourceId: string, newStatus: string) => {
    const TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODNlZDVlYTY0ODUxNzk2MWZlYmQ2OGQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk4ODkzNzgsImV4cCI6MTc1MDQ5NDE3OH0.GkczutuRZ01PJuoWkHzoLx2PB_gBDkEGAfMyiN7-4XI";

    try {
      // Optimistically update the UI first - remove the item from the list immediately
      setRequests((prevRequests) =>
        prevRequests.filter((request) => String(request._id) !== resourceId)
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/${resourceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        await fetchResources();
        throw new Error("Failed to update resource status");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Status updated", {
          description: "The request was successfully processed.",
        });
      } else {
        // If the API response indicates failure, revert and refresh
        await fetchResources();
        throw new Error(result.message || "Failed to update resource status");
      }
    } catch (error) {
      console.error("Error updating resource status:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update resource status",
      });

      // Refresh data to ensure UI is in sync with server state
      //   await fetchResources()
    }
  };

  const handleMessage = (request: ResourceRequest) => {
    console.log("Opening message for resource:", request.name);
    toast("Message", {
      description: `Opening message for ${request.name}`,
    });
  };

  const totalItems = requests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: ResourceColumn[] = [
    {
      key: "name",
      label: "Resource Name",
      render: (value: unknown, row: ResourceRequest) => (
        <div className="flex items-center space-x-3">
          <Image
            src={row.thumbnail || "/placeholder.svg"}
            alt="Resource thumbnail"
            width={40}
            height={40}
            className="rounded"
          />
          <span className="max-w-xs truncate">{String(value)}</span>
        </div>
      ),
    },
    {
      key: "seller",
      label: "Seller Name",
      render: (value: unknown) => {
        const seller = value as Seller;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={seller.avatar || "/placeholder.svg"} />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <span>{seller.name}</span>
          </div>
        );
      },
    },
    { key: "id", label: "ID" },
    { key: "price", label: "Price" },
    { key: "discountPrice", label: "Discount Price" },
    { key: "quantity", label: "Quantity" },
    { key: "format", label: "Format" },
    {
      key: "date",
      label: "Date",
      render: (value: unknown) => (
        <div className="whitespace-pre-line text-sm">{String(value)}</div>
      ),
    },
    {
      key: "statuses",
      label: "Action",
      render: (value: unknown, row: ResourceRequest) => {
        return (
          <div className="flex items-center space-x-2">
            <Select
              onValueChange={(newStatus) =>
                handleStatusChange(row._id.toString(), newStatus)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      key: "message",
      label: "Message",
      render: (value: unknown, row: ResourceRequest) => (
        <Button variant="outline" size="sm" onClick={() => handleMessage(row)}>
          <MessageSquare className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-center items-center h-64">
              Loading...
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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Request Resource
            </h1>
            <p className="text-gray-500">Dashboard &gt; Request Resource</p>
          </div>

          <DataTable
            columns={columns}
            data={requests}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

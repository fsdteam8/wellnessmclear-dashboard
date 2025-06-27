"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import type { ResourceRequest, ResourceColumn, Seller } from "@/type/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";
import noImage from "@/public/images/NoImage.png";
import { ChatModal } from "@/components/ChatModal";

// Custom Image component with fallback
const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // Check if src exists and is not empty/whitespace
    if (src && src.trim()) {
      return src.trim();
    }
    return noImage.src || "/images/NoImage.png";
  });

  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(noImage.src || "/images/NoImage.png");
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
};

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

// API functions
const fetchResources = async (): Promise<ResourceRequest[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/get-all-resources`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch resources");
  }

  const pendingResources = data.data
    .filter((resource: ApiResourceRequest) => resource.status === "pending")
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
      thumbnail: resource.thumbnail || "/placeholder.svg?height=40&width=40",
      statuses: ["pending"],
      _id: resource._id,
    }));

  return pendingResources;
};

const updateResourceStatus = async ({
  resourceId,
  status,
  token,
}: {
  resourceId: string;
  status: string;
  token: string;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/${resourceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update resource status");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to update resource status");
  }

  return result;
};

export default function RequestResourcePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.accessToken || "";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null
  );

  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["resources", "pending"],
    queryFn: fetchResources,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  console.log("Requests:", requests);
  const statusMutation = useMutation({
    mutationFn: ({
      resourceId,
      status,
    }: {
      resourceId: string;
      status: string;
    }) => {
      if (!token) throw new Error("No token found");
      return updateResourceStatus({ resourceId, status, token });
    },
    onMutate: async ({ resourceId }) => {
      await queryClient.cancelQueries({ queryKey: ["resources", "pending"] });
      const previousRequests = queryClient.getQueryData<ResourceRequest[]>([
        "resources",
        "pending",
      ]);
      queryClient.setQueryData<ResourceRequest[]>(
        ["resources", "pending"],
        (old) =>
          old?.filter((request) => String(request?._id) !== resourceId) || []
      );
      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(
          ["resources", "pending"],
          context.previousRequests
        );
      }
      toast.error("Error", {
        description:
          err instanceof Error
            ? err.message
            : "Failed to update resource status",
      });
    },
    onSuccess: () => {
      toast.success("Status updated", {
        description: "The request was successfully processed.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"], exact: false });
    },
  });

  const handleStatusChange = async (resourceId: string, newStatus: string) => {
    statusMutation.mutate({ resourceId, status: newStatus });
  };

  // const handleMessage = (request: ResourceRequest) => {
  //   toast("Message", {
  //     description: `Opening message for ${request.name}`,
  //   });
  // };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <p className="text-red-600">
                Error:{" "}
                {error instanceof Error
                  ? error.message
                  : "Something went wrong"}
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = requests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: ResourceColumn[] = [
    {
      key: "name",
      label: "Resource Name",
      render: (value: unknown, row: ResourceRequest) => (
        <div className="flex items-center space-x-3">
          <ImageWithFallback
            src={row.thumbnail}
            alt="Resource thumbnail"
            width={40}
            height={40}
            className="rounded object-cover"
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
    { key: "_id", label: "ID" },
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
        const isUpdating =
          statusMutation.isPending &&
          statusMutation.variables?.resourceId === row._id.toString();
        return (
          <div className="flex items-center space-x-2">
            <Select
              onValueChange={(newStatus) =>
                handleStatusChange(row._id.toString(), newStatus)
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="w-32">
                <SelectValue
                  placeholder={isUpdating ? "Updating..." : "Status"}
                />
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
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsChatOpen(true);
              setSelectedResourceId(row._id);
              console.log("Selected Resource ID:", row._id);
            }}
            className="text-[#424242] hover:text-green-600"
            title="Message"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
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
          <DataTable<ResourceRequest>
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
      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        resourceId={selectedResourceId ? String(selectedResourceId) : ""}
      />
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { PageHeader } from "@/components/page-header";
// import { DataTable } from "@/components/data-table";
// import Image from "next/image";
// import type { Product } from "@/type/types";
// import { toast } from "sonner";
// import { useSession } from "next-auth/react";
// import { PuffLoader } from "react-spinners";

// // Interfaces
// interface ApiResourceRequest {
//   _id: string;
//   title: string;
//   country: string;
//   states: string[];
//   resourceType: string[];
//   description: string;
//   price: number;
//   discountPrice: number;
//   quantity: number;
//   format: string;
//   file: {
//     url: string | null;
//     type: string | null;
//   };
//   thumbnail: string;
//   createdBy: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     profileImage: string;
//   };
//   status: string;
//   practiceAreas: string[];
//   productId: string;
//   createdAt: string;
//   averageRating: number;
//   totalReviews: number;
// }

// interface ApiResponse {
//   success: boolean;
//   data: ApiResourceRequest[];
//   message?: string;
// }

// interface ExtendedProduct extends Product {
//   originalId: string;
// }

// // Fetch resources
// const fetchResources = async (): Promise<ExtendedProduct[]> => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/get-all-resources`
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch resources");
//   }

//   const data: ApiResponse = await response.json();

//   if (!data.success) {
//     throw new Error(data.message || "Failed to fetch resources");
//   }

//   const approvedResources = data.data
//     .filter((resource: ApiResourceRequest) => resource.status === "approved")
//     .map(
//       (resource: ApiResourceRequest): ExtendedProduct => ({
//         id: Number(resource._id) || 0,
//         originalId: resource._id,
//         name: resource.title,
//         price: `$${resource.price}`,
//         discountPrice: `$${resource.discountPrice}`,
//         quantity: resource.quantity,
//         format: resource.format,
//         date:
//           new Date(resource.createdAt).toLocaleDateString() +
//           "\n" +
//           new Date(resource.createdAt).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         thumbnail: resource.thumbnail || "/placeholder.svg?height=40&width=40",
//       })
//     );

//   return approvedResources;
// };

// // DELETE resource
// const deleteResource = async (
//   resourceId: string,
//   token: string
// ): Promise<void> => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/resource/${resourceId}`,
//     {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.message || "Failed to delete resource");
//   }

//   const result = await response.json();
//   if (!result.success) {
//     throw new Error(result.message || "Failed to delete resource");
//   }
// };

// // Column definitions
// const columns = [
//   {
//     key: "name",
//     label: "Resource Name",
//     render: (value: string, row: ExtendedProduct) => (
//       <div className="flex items-center space-x-3">
//         <Image
//           src={row.thumbnail || "/placeholder.svg?height=40&width=40"}
//           alt="Resource thumbnail"
//           width={40}
//           height={40}
//           className="rounded object-cover"
//         />
//         <span className="max-w-xs truncate font-medium">{value}</span>
//       </div>
//     ),
//   },
//    { key: "originalId", label: "Id" },
//   { key: "price", label: "Price" },
 
//   { key: "discountPrice", label: "Discount Price" },
//   { key: "quantity", label: "Quantity" },
//   { key: "format", label: "Format" },
//   {
//     key: "date",
//     label: "Date",
//     render: (value: string) => (
//       <div className="whitespace-pre-line text-sm">{value}</div>
//     ),
//   },
// ];

// export default function ResourceListPage() {
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 9;
//   const session = useSession();
//   const TOKEN = session?.data?.accessToken || "";

//   const {
//     data: resources = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["resources", "approved"],
//     queryFn: fetchResources,
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
//   });

//   const queryClient = useQueryClient();

//   const deleteMutation = useMutation({
//     mutationFn: (resourceId: string) => deleteResource(resourceId, TOKEN),
//     onMutate: async (resourceId) => {
//       await queryClient.cancelQueries({ queryKey: ["resources", "approved"] });
//       const previousResources = queryClient.getQueryData<ExtendedProduct[]>([
//         "resources",
//         "approved",
//       ]);
//       queryClient.setQueryData<ExtendedProduct[]>(
//         ["resources", "approved"],
//         (old) =>
//           old?.filter((resource) => resource.originalId !== resourceId) || []
//       );
//       return { previousResources };
//     },
//     onError: (err, resourceId, context) => {
//       if (context?.previousResources) {
//         queryClient.setQueryData(
//           ["resources", "approved"],
//           context.previousResources
//         );
//       }
//       toast.error("Delete Failed", {
//         description:
//           err instanceof Error ? err.message : "Failed to delete resource",
//       });
//     },
//     onSuccess: () => {
//       toast.success("Delete successfully !");
//       window.location.reload();
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["resources", "approved"] });
//     },
//   });

//   const totalItems = resources.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const handleAddResource = () => {
//     router.push("/resource-list/add");
//   };

//   const handleEdit = (resource: ExtendedProduct) => {
//     router.push(`/resource-list/edit/${resource.originalId}`);
//   };

//   const handleDelete = (resource: ExtendedProduct) => {
//     deleteMutation.mutate(resource.originalId);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <PuffLoader
//             color="rgba(49, 23, 215, 1)"
//             loading
//             speedMultiplier={1}
//             size={60}
//           />
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="flex flex-col justify-center items-center h-64 space-y-4">
//           <div className="text-lg text-red-600 text-center">
//             Error loading resources:{" "}
//             {error instanceof Error ? error.message : "Unknown error"}
//           </div>
//           <button
//             onClick={() => refetch()}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="mb-10">
//         <PageHeader
//           onButtonClick={handleAddResource}
//           title="Resource List"
//           buttonText="Add Resource"
//         />
//         <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
//       </div>

//       <DataTable
//         columns={columns}
//         data={resources}
//         currentPage={currentPage}
//         totalPages={totalPages}
//         totalItems={totalItems}
//         itemsPerPage={itemsPerPage}
//         onPageChange={setCurrentPage}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//         isDeleting={deleteMutation.isPending}
//       />
//     </div>
//   );
// }






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
  message?: string;
}

interface ExtendedProduct extends Product {
  originalId: string;
}

// Fetch resources
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

  const approvedResources = data.data
    .filter((resource: ApiResourceRequest) => resource.status === "approved")
    .map(
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

  return approvedResources;
};

// DELETE resource
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete resource");
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to delete resource");
  }
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
  const itemsPerPage = 9;
  const session = useSession();
  const TOKEN = session?.data?.accessToken || "";

  const {
    data: resources = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["resources", "approved"],
    queryFn: fetchResources,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (resourceId: string) => deleteResource(resourceId, TOKEN),
    onMutate: async (resourceId) => {
      await queryClient.cancelQueries({ queryKey: ["resources", "approved"] });
      const previousResources = queryClient.getQueryData<ExtendedProduct[]>([
        "resources",
        "approved",
      ]);
      queryClient.setQueryData<ExtendedProduct[]>(
        ["resources", "approved"],
        (old) =>
          old?.filter((resource) => resource.originalId !== resourceId) || []
      );
      return { previousResources };
    },
    onError: (err, resourceId, context) => {
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
      toast.success("Delete successfully !");
      window.location.reload();
    },
    onSettled: () => {
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
    deleteMutation.mutate(resource.originalId);
  };

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

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
  );
}
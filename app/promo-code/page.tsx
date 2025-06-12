// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { PageHeader } from "@/components/page-header";
// import { DataTable } from "@/components/data-table";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";

// // Types
// type PromoCode = {
//   _id: string;
//   code: string;
//   discountType: "Percentage" | "Fixed";
//   discountValue: number;
//   expiryDate: string;
//   usageLimit: number;
//   active: boolean;
//   usedCount: number;
//   createdBy: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//   };
//   createdAt: string;
//   updatedAt: string;
// };

// type ApiResponse = {
//   status: boolean;
//   message: string;
//   data: {
//     data: PromoCode[];
//     pagination: {
//       currentPage: number;
//       totalPages: number;
//       totalData: number;
//       hasNextPage: boolean;
//       hasPrevPage: boolean;
//     };
//   };
// };

// type DeleteResponse = {
//   status: boolean;
//   message: string;
// };

// // API Functions
// const fetchPromoCodes = async (page: number = 1, limit: number = 10): Promise<ApiResponse> => {
//   const TOKEN =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes?page=${page}&limit=${limit}`,
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: 'Network error' }));
//     throw new Error(errorData.message || "Failed to fetch promo codes");
//   }

//   return response.json();
// };

// const deletePromoCode = async (id: string): Promise<DeleteResponse> => {
//   const TOKEN =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

//   console.log(`Deleting promo code with ID: ${id}`);

//   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes/${id}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${TOKEN}`,
//     },
//   });

//   console.log('Delete response status:', response.status);

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: 'Failed to delete' }));
//     console.error('Delete error:', errorData);
//     throw new Error(errorData.message || `Failed to delete promo code (${response.status})`);
//   }

//   const result = await response.json();
//   console.log('Delete result:', result);
//   return result;
// };

// // Utility functions
// const formatDate = (dateString: string): string => {
//   return new Date(dateString).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "2-digit",
//   });
// };

// const formatDiscount = (discountType: string, discountValue: number): string => {
//   return discountType === "Percentage" ? `${discountValue}%` : `$${discountValue}`;
// };

// const getStatus = (active: boolean, expiryDate: string): string => {
//   if (!active) return "Inactive";
//   const now = new Date();
//   const expiry = new Date(expiryDate);
//   return expiry > now ? "Active" : "Expired";
// };

// const isEmpty = (arr: any[]) => !arr || arr.length === 0;

// // Table columns configuration
// const columns = [
//   { 
//     key: "code", 
//     label: "Code ID",
//     render: (value: string) => value
//   },
//   { 
//     key: "discount", 
//     label: "Discount",
//     render: (value: string, row: any) => formatDiscount(row.discountType, row.discountValue)
//   },
//   { 
//     key: "createdAt", 
//     label: "Start Date",
//     render: (value: string) => formatDate(value)
//   },
//   { 
//     key: "expiryDate", 
//     label: "End Date",
//     render: (value: string) => formatDate(value)
//   },
//   {
//     key: "status",
//     label: "Status",
//     render: (value: string, row: any) => {
//       const status = getStatus(row.active, row.expiryDate);
//       return (
//         <Badge
//           variant={status === "Active" ? "default" : "secondary"}
//           className={
//             status === "Active"
//               ? "bg-[#008000] text-white border border-green-200"
//               : status === "Inactive"
//               ? "bg-[#FFA300] text-white border border-yellow-200"
//               : "bg-red-500 text-white border border-red-200"
//           }
//         >
//           {status}
//         </Badge>
//       );
//     },
//   },
//   {
//     key: "usageLimit",
//     label: "Usage",
//     render: (value: number, row: any) => `${row.usedCount}/${value}`
//   },
// ];

// export default function PromoCodePage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Fetch promo codes using TanStack Query
//   const {
//     data: promoCodesResponse,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["promoCodes", currentPage, itemsPerPage],
//     queryFn: () => fetchPromoCodes(currentPage, itemsPerPage),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });

//   // Delete mutation with improved error handling
//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => {
//       console.log('Delete mutation called for ID:', id);
//       return deletePromoCode(id);
//     },
//     onMutate: async (deletedId) => {
//       // Cancel any outgoing refetches
//       await queryClient.cancelQueries({ queryKey: ["promoCodes"] });

//       // Snapshot the previous value for rollback
//       const previousData = queryClient.getQueryData(["promoCodes", currentPage, itemsPerPage]);

//       // Optimistically remove the item from the cache
//       queryClient.setQueryData(
//         ["promoCodes", currentPage, itemsPerPage],
//         (old: ApiResponse | undefined) => {
//           if (!old) return old;
          
//           return {
//             ...old,
//             data: {
//               ...old.data,
//               data: old.data.data.filter(item => item._id !== deletedId),
//               pagination: {
//                 ...old.data.pagination,
//                 totalData: old.data.pagination.totalData - 1
//               }
//             }
//           };
//         }
//       );

//       // Return a context object with the snapshotted value
//       return { previousData };
//     },
//     onError: (error: Error, variables, context) => {
//       // If the mutation fails, use the context returned from onMutate to roll back
//       if (context?.previousData) {
//         queryClient.setQueryData(
//           ["promoCodes", currentPage, itemsPerPage],
//           context.previousData
//         );
//       }
      
//       console.error('Delete failed:', error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete promo code.",
//         variant: "destructive",
//       });
//     },
//     onSuccess: (data, variables) => {
//       console.log('Delete successful:', data);
//       toast({
//         title: "Success",
//         description: data.message || "Promo code deleted successfully.",
//       });
//     },
//     onSettled: () => {
//       // Always refetch after error or success to ensure consistency
//       queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
//     },
//   });

//   const handleAddCode = () => {
//     router.push("/promo-code/add");
//   };

//   const handleEdit = (code: PromoCode) => {
//     router.push(`/promo-code/edit/${code._id}`);
//   };

//   const handleDelete = async (code: PromoCode) => {
//     console.log('Delete handler called for code:', code);
    
//     // No need for window.confirm here since DataTable handles the confirmation dialog
//     try {
//       await deleteMutation.mutateAsync(code._id);
//     } catch (error) {
//       // Error is already handled in the mutation's onError callback
//       console.error('Delete operation failed:', error);
//     }
//   };

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   // Transform API data for the table
//   const tableData = promoCodesResponse?.data.data || [];
//   const pagination = promoCodesResponse?.data.pagination;

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex h-screen bg-gray-100">
//         <div className="flex-1 overflow-auto">
//           <div className="p-6">
//             <div className="mb-10">
//               <PageHeader
//                 onButtonClick={handleAddCode}
//                 title="Code List"
//                 buttonText="Add Code"
//               />
//               <p className="text-gray-500 -mt-4">
//                 Dashboard &gt; Code &gt; Code List
//               </p>
//             </div>
//             <div className="flex justify-center items-center h-64">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
//                 <p className="text-lg">Loading promo codes...</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (isError) {
//     return (
//       <div className="flex h-screen bg-gray-100">
//         <div className="flex-1 overflow-auto">
//           <div className="p-6">
//             <div className="mb-10">
//               <PageHeader
//                 onButtonClick={handleAddCode}
//                 title="Code List"
//                 buttonText="Add Code"
//               />
//               <p className="text-gray-500 -mt-4">
//                 Dashboard &gt; Code &gt; Code List
//               </p>
//             </div>
//             <div className="flex justify-center items-center h-64">
//               <div className="text-red-500 text-center">
//                 <p className="text-lg mb-2">Error loading promo codes</p>
//                 <p className="text-sm">{error?.message || "Unknown error"}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main render
//   return (
//     <div className="flex h-screen bg-gray-100">
//       <div className="flex-1 overflow-auto">
//         <div className="p-6">
//           <div className="mb-10">
//             <PageHeader
//               onButtonClick={handleAddCode}
//               title="Code List"
//               buttonText="Add Code"
//             />
//             <p className="text-gray-500 -mt-4">
//               Dashboard &gt; Code &gt; Code List
//             </p>
//           </div>

//           {isEmpty(tableData) ? (
//             <div className="text-center text-gray-500 mt-20 text-lg">
//               No promo codes found.
//             </div>
//           ) : (
//             <DataTable
//               columns={columns}
//               data={tableData}
//               currentPage={pagination?.currentPage || 1}
//               totalPages={pagination?.totalPages || 1}
//               totalItems={pagination?.totalData || 0}
//               itemsPerPage={itemsPerPage}
//               onPageChange={handlePageChange}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               isDeleting={deleteMutation.isPending}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Types
type PromoCode = {
  _id: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  active: boolean;
  usedCount: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  status: boolean;
  message: string;
  data: {
    data: PromoCode[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalData: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
};

type DeleteResponse = {
  status: boolean;
  message: string;
};

// Column type for table configuration
type TableColumn = {
  key: string;
  label: string;
  render: (value: string | number, row: PromoCode) => React.ReactNode;
};

// API Functions
const fetchPromoCodes = async (page: number = 1, limit: number = 10): Promise<ApiResponse> => {
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes?page=${page}&limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || "Failed to fetch promo codes");
  }

  return response.json();
};

const deletePromoCode = async (id: string): Promise<DeleteResponse> => {
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

  console.log(`Deleting promo code with ID: ${id}`);

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  console.log('Delete response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete' }));
    console.error('Delete error:', errorData);
    throw new Error(errorData.message || `Failed to delete promo code (${response.status})`);
  }

  const result = await response.json();
  console.log('Delete result:', result);
  return result;
};

// Utility functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatDiscount = (discountType: string, discountValue: number): string => {
  return discountType === "Percentage" ? `${discountValue}%` : `$${discountValue}`;
};

const getStatus = (active: boolean, expiryDate: string): string => {
  if (!active) return "Inactive";
  const now = new Date();
  const expiry = new Date(expiryDate);
  return expiry > now ? "Active" : "Expired";
};

const isEmpty = (arr: PromoCode[]) => !arr || arr.length === 0;

// Table columns configuration
const columns: TableColumn[] = [
  { 
    key: "code", 
    label: "Code ID",
    render: (value: string | number) => value
  },
  { 
    key: "discount", 
    label: "Discount",
    render: (value: string | number, row: PromoCode) => formatDiscount(row.discountType, row.discountValue)
  },
  { 
    key: "createdAt", 
    label: "Start Date",
    render: (value: string | number) => formatDate(value as string)
  },
  { 
    key: "expiryDate", 
    label: "End Date",
    render: (value: string | number) => formatDate(value as string)
  },
  {
    key: "status",
    label: "Status",
    render: (value: string | number, row: PromoCode) => {
      const status = getStatus(row.active, row.expiryDate);
      return (
        <Badge
          variant={status === "Active" ? "default" : "secondary"}
          className={
            status === "Active"
              ? "bg-[#008000] text-white border border-green-200"
              : status === "Inactive"
              ? "bg-[#FFA300] text-white border border-yellow-200"
              : "bg-red-500 text-white border border-red-200"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    key: "usageLimit",
    label: "Usage",
    render: (value: string | number, row: PromoCode) => `${row.usedCount}/${value}`
  },
];

export default function PromoCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch promo codes using TanStack Query
  const {
    data: promoCodesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["promoCodes", currentPage, itemsPerPage],
    queryFn: () => fetchPromoCodes(currentPage, itemsPerPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Delete mutation with improved error handling
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Delete mutation called for ID:', id);
      return deletePromoCode(id);
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["promoCodes"] });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData(["promoCodes", currentPage, itemsPerPage]);

      // Optimistically remove the item from the cache
      queryClient.setQueryData(
        ["promoCodes", currentPage, itemsPerPage],
        (old: ApiResponse | undefined) => {
          if (!old) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.filter(item => item._id !== deletedId),
              pagination: {
                ...old.data.pagination,
                totalData: old.data.pagination.totalData - 1
              }
            }
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: Error, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(
          ["promoCodes", currentPage, itemsPerPage],
          context.previousData
        );
      }
      
      console.error('Delete failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log('Delete successful:', data);
      toast({
        title: "Success",
        description: data.message || "Promo code deleted successfully.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });

  const handleAddCode = () => {
    router.push("/promo-code/add");
  };

  const handleEdit = (code: PromoCode) => {
    router.push(`/promo-code/edit/${code._id}`);
  };

  const handleDelete = async (code: PromoCode) => {
    console.log('Delete handler called for code:', code);
    
    // No need for window.confirm here since DataTable handles the confirmation dialog
    try {
      await deleteMutation.mutateAsync(code._id);
    } catch (error) {
      // Error is already handled in the mutation's onError callback
      console.error('Delete operation failed:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Transform API data for the table
  const tableData = promoCodesResponse?.data.data || [];
  const pagination = promoCodesResponse?.data.pagination;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-10">
              <PageHeader
                onButtonClick={handleAddCode}
                title="Code List"
                buttonText="Add Code"
              />
              <p className="text-gray-500 -mt-4">
                Dashboard &gt; Code &gt; Code List
              </p>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                <p className="text-lg">Loading promo codes...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-10">
              <PageHeader
                onButtonClick={handleAddCode}
                title="Code List"
                buttonText="Add Code"
              />
              <p className="text-gray-500 -mt-4">
                Dashboard &gt; Code &gt; Code List
              </p>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500 text-center">
                <p className="text-lg mb-2">Error loading promo codes</p>
                <p className="text-sm">{error?.message || "Unknown error"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-10">
            <PageHeader
              onButtonClick={handleAddCode}
              title="Code List"
              buttonText="Add Code"
            />
            <p className="text-gray-500 -mt-4">
              Dashboard &gt; Code &gt; Code List
            </p>
          </div>

          {isEmpty(tableData) ? (
            <div className="text-center text-gray-500 mt-20 text-lg">
              No promo codes found.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              currentPage={pagination?.currentPage || 1}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.totalData || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
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
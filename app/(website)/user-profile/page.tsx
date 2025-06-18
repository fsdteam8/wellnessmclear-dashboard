// "use client";

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// // import { DataTable } from "@/components/data-table";
// // import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { DataTable } from "@/components/data-table";
// import { Card, CardContent } from "@/components/ui/card";

// interface ApiUser {
//   id: string;
//   name: string;
//   profileImage: string;
//   totalOrders: number;
//   deliveredOrders: number;
//   pendingOrders: number;
//   cancelledOrders: number;
// }

// interface ApiResponse {
//   status: string;
//   message: string;
//   data: ApiUser[];
// }

// interface DisplayUser {
//   id: string;
//   userId: string;
//   name: string;
//   avatar: string;
//   totalOrder: number;
//   deliveredOrder: number;
//   pendingOrder: number;
//   cancelOrder: number;
// }

// const TOKEN =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

// const fetchUsers = async (page: number = 1): Promise<ApiResponse> => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-profiles?page=${page}`,
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch users");
//   }

//   return response.json();
// };

// const transformUsers = (apiUsers: ApiUser[]): DisplayUser[] => {
//   const transformed = apiUsers.map((user) => ({
//     id: user.id,
//     userId: user.id,
//     name: user.name,
//     avatar: user.profileImage || "/placeholder.svg?height=32&width=32",
//     totalOrder: user.totalOrders,
//     deliveredOrder: user.deliveredOrders,
//     pendingOrder: user.pendingOrders,
//     cancelOrder: user.cancelledOrders,
//   }));
  
//   console.log("Transformed Display Users:", transformed);
//   return transformed;
// };

// const columns = [
//   { key: "userId", label: "User ID" },
//   {
//     key: "name",
//     label: "User Name",
//     render: (_: unknown, row: DisplayUser) => (
//       <div className="flex items-center space-x-2">
//         <Avatar className="h-8 w-8">
//           <AvatarImage src={row.avatar} alt={row.name} />
//           <AvatarFallback>
//             {row.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
//           </AvatarFallback>
//         </Avatar>
//         <span className="font-medium">{row.name}</span>
//       </div>
//     ),
//   },
//   { key: "totalOrder", label: "Total Order" },
//   { key: "deliveredOrder", label: "Delivered Order" },
//   { key: "pendingOrder", label: "Pending Order" },
//   { key: "cancelOrder", label: "Cancel Order" },
//   {
//     key: "action",
//     label: "Action",
//     render: (_: unknown, row: DisplayUser) => (
//       <Button
//         variant="outline"
//         size="sm"
//         className="bg-slate-600 text-white hover:bg-slate-700"
//         onClick={() => console.log("View details for user:", row.id)}
//       >
//         Details
//       </Button>
//     ),
//   },
// ];

// export default function UserProfilePage() {
//   const [currentPage, setCurrentPage] = useState(1);

//   const {
//     data: apiResponse,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["users", currentPage],
//     queryFn: () => fetchUsers(currentPage),
//     staleTime: 5 * 60 * 1000,
//   });

//   const displayUsers = apiResponse ? transformUsers(apiResponse.data) : [];

//   const totalSales = displayUsers.reduce(
//     (sum, user) => sum + user.totalOrder * 65.5,
//     0
//   );

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex h-screen bg-gray-50 items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//           <p className="mt-4 text-gray-600">Loading users...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex h-screen bg-gray-50 items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">
//             Error loading users: {error?.message}
//           </p>
//           <Button
//             onClick={() => window.location.reload()}
//             className="bg-slate-600 text-white hover:bg-slate-700"
//           >
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <div className="flex-1 overflow-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <div className="mt-4">
//                 <h1 className="text-2xl font-semibold text-gray-900">
//                   User Profile
//                 </h1>
//                 <p className="text-gray-500">Dashboard User Profile</p>
//               </div>
//             </div>
//             <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
//               <CardContent className="p-4">
//                 <div className="space-y-3">
//                   <p className="text-base opacity-90 ml-2">Total Sales</p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
//                     <p className="text-[16px] font-bold">
//                       $
//                       {totalSales.toLocaleString("en-US", {
//                         minimumFractionDigits: 2,
//                       })}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="mb-4 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing {displayUsers.length} of {displayUsers.length} users
//             </p>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">
//                 Page {currentPage} of {1}
//               </span>
//             </div>
//           </div>

//           <DataTable
//             columns={columns}
//             data={displayUsers}
//             currentPage={currentPage}
//             totalPages={1}
//             totalItems={displayUsers.length}
//             itemsPerPage={displayUsers.length}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";

interface ApiUser {
  id: string;
  name: string;
  profileImage: string;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

interface ApiResponse {
  status: string;
  message: string;
  data: ApiUser[];
  pagination?: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface DisplayUser {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  totalOrder: number;
  deliveredOrder: number;
  pendingOrder: number;
  cancelOrder: number;
}

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

const fetchUsers = async (page: number = 1): Promise<ApiResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-profiles?page=${page}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

const transformUsers = (apiUsers: ApiUser[]): DisplayUser[] => {
  const transformed = apiUsers.map((user) => ({
    id: user.id,
    userId: user.id,
    name: user.name,
    avatar: user.profileImage || "/placeholder.svg?height=32&width=32",
    totalOrder: user.totalOrders,
    deliveredOrder: user.deliveredOrders,
    pendingOrder: user.pendingOrders,
    cancelOrder: user.cancelledOrders,
  }));
  
  console.log("Transformed Display Users:", transformed);
  return transformed;
};

const columns = [
  { key: "userId", label: "User ID" },
  {
    key: "name",
    label: "User Name",
    render: (_: unknown, row: DisplayUser) => (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.avatar} alt={row.name} />
          <AvatarFallback>
            {row.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.name}</span>
      </div>
    ),
  },
  { key: "totalOrder", label: "Total Order" },
  { key: "deliveredOrder", label: "Delivered Order" },
  { key: "pendingOrder", label: "Pending Order" },
  { key: "cancelOrder", label: "Cancel Order" },
  {
    key: "action",
    label: "Action",
    render: (_: unknown, row: DisplayUser) => (
      <Button
        variant="outline"
        size="sm"
        className="bg-slate-600 text-white hover:bg-slate-700"
        onClick={() => console.log("View details for user:", row.id)}
      >
        Details
      </Button>
    ),
  },
];

export default function UserProfilePage() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", currentPage],
    queryFn: () => fetchUsers(currentPage),
    staleTime: 5 * 60 * 1000,
  });

  const displayUsers = apiResponse ? transformUsers(apiResponse.data) : [];

  // Get pagination info from API response or use defaults
  const totalPages = apiResponse?.pagination?.totalPages || Math.ceil(displayUsers.length / 10);
  const totalItems = apiResponse?.pagination?.totalItems || displayUsers.length;
  const itemsPerPage = apiResponse?.pagination?.itemsPerPage || 10;

  const totalSales = displayUsers.reduce(
    (sum, user) => sum + user.totalOrder * 65.5,
    0
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading users: {error?.message}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-slate-600 text-white hover:bg-slate-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  User Profile
                </h1>
                <p className="text-gray-500">Dashboard User Profile</p>
              </div>
            </div>
            <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-base opacity-90 ml-2">Total Sales</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
                    <p className="text-[16px] font-bold">
                      $
                      {totalSales.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {displayUsers.length} of {totalItems} users
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={displayUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// // import { Breadcrumb } from "@/components/breadcrumb";
// import { DataTable } from "@/components/data-table";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// // Types based on your API response
// interface Address {
//   country: string;
//   cityState: string;
//   roadArea: string;
//   postalCode: string;
//   taxId: string;
// }

// interface ApiUser {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   email: string;
//   username: string;
//   dob: string | null;
//   gender: string;
//   role: string;
//   sellerStatus: string;
//   bio: string;
//   profileImage: string;
//   multiProfileImage: string[];
//   pdfFile: string;
//   otp: string | null;
//   otpExpires: string | null;
//   refreshToken: string;
//   hasActiveSubscription: boolean;
//   subscriptionExpireDate: string | null;
//   address: Address;
// }

// interface ApiResponse {
//   status: boolean;
//   message: string;
//   data: {
//     users: ApiUser[];
//     paginationInfo: {
//       currentPage: number;
//       totalPages: number;
//       totalData: number;
//       hasNextPage: boolean;
//       hasPrevPage: boolean;
//     };
//   };
// }

// // Transformed user type for display
// interface DisplayUser {
//   id: string;
//   userId: string;
//   name: string;
//   avatar: string;
//   email: string;
//   role: string;
//   phoneNumber: string;
//   totalOrder: number;
//   deliveredOrder: number;
//   pendingOrder: number;
//   cancelOrder: number;
// }


// const TOKEN =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

// // API fetch function
// const fetchUsers = async (page: number = 1): Promise<ApiResponse> => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-users?page=${page}`,{
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//         });
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch users');
//   }
  
//   return response.json();
// };

// // Transform API data to display format
// const transformUsers = (apiUsers: ApiUser[]): DisplayUser[] => {
//   return apiUsers.map((user) => ({
//     id: user._id,
//     userId: user._id, // Use last 4 characters of _id as userId
//     name: `${user.firstName} ${user.lastName}`.trim(),
//     avatar: user.profileImage || "/placeholder.svg?height=32&width=32",
//     email: user.email,
//     role: user.role,
//     phoneNumber: user.phoneNumber || "N/A",
//     // Mock order data since it's not in the API response
//     totalOrder: Math.floor(Math.random() * 300) + 50,
//     deliveredOrder: Math.floor(Math.random() * 200) + 30,
//     pendingOrder: Math.floor(Math.random() * 50) + 5,
//     cancelOrder: Math.floor(Math.random() * 20) + 1,
//   }));
// };

// const columns = [
//   { key: "userId", label: "User ID" },
//   {
//     key: "name",
//     label: "User Name",
//     render: (value: string, row: DisplayUser) => (
//       <div className="flex items-center space-x-2">
//         <Avatar className="h-8 w-8">
//           <AvatarImage src={row.avatar} alt={row.name} />
//           <AvatarFallback>
//             {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
//           </AvatarFallback>
//         </Avatar>
//         <div>
//           <span className="font-medium">{value}</span>
//           <p className="text-xs text-gray-500">{row.email}</p>
//         </div>
//       </div>
//     ),
//   },
//   { 
//     key: "role", 
//     label: "Role",
//     render: (value: string) => (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//         value === 'ADMIN' ? 'bg-red-100 text-red-800' :
//         value === 'SELLER' ? 'bg-blue-100 text-blue-800' :
//         'bg-green-100 text-green-800'
//       }`}>
//         {value}
//       </span>
//     ),
//   },
//   { key: "phoneNumber", label: "Phone" },
//   { key: "totalOrder", label: "Total Order" },
//   { key: "deliveredOrder", label: "Delivered Order" },
//   { key: "pendingOrder", label: "Pending Order" },
//   { key: "cancelOrder", label: "Cancel Order" },
//   {
//     key: "action",
//     label: "Action",
//     render: (value: any, row: DisplayUser) => (
//       <Button
//         variant="outline"
//         size="sm"
//         className="bg-slate-600 text-white hover:bg-slate-700"
//         onClick={() => console.log('View details for user:', row.id)}
//       >
//         Details
//       </Button>
//     ),
//   },
// ];

// export default function UserProfilePage() {
//   const [currentPage, setCurrentPage] = useState(1);
  
//   // TanStack Query for fetching users
//   const {
//     data: apiResponse,
//     isLoading,
//     isError,
//     error
//   } = useQuery({
//     queryKey: ['users', currentPage],
//     queryFn: () => fetchUsers(currentPage),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   // Transform data for display
//   const displayUsers = apiResponse ? transformUsers(apiResponse.data.users) : [];
//   const paginationInfo = apiResponse?.data.paginationInfo;

//   // Calculate total sales (mock calculation)
//   const totalSales = displayUsers.reduce((sum, user) => sum + (user.totalOrder * 65.50), 0);

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
//           <p className="text-red-600 mb-4">Error loading users: {error?.message}</p>
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
//               {/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "User Profile" }]} /> */}
//               <div className="mt-4">
//                 <h1 className="text-2xl font-semibold text-gray-900">
//                   User Profile
//                 </h1>
//                 <p className="text-gray-500">Dashboard &gt; User Profile</p>
//               </div>
//             </div>
//             <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
//               <CardContent className="p-4">
//                 <div className="space-y-3">
//                   <p className="text-base opacity-90 ml-2">Total Sales</p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
//                     <p className="text-[16px] font-bold">
//                       ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="mb-4 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing {displayUsers.length} of {paginationInfo?.totalData || 0} users
//             </p>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">
//                 Page {paginationInfo?.currentPage || 1} of {paginationInfo?.totalPages || 1}
//               </span>
//             </div>
//           </div>

//           <DataTable
//             columns={columns}
//             data={displayUsers}
//             currentPage={paginationInfo?.currentPage || 1}
//             totalPages={paginationInfo?.totalPages || 1}
//             totalItems={paginationInfo?.totalData || 0}
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
import { DataTable } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Address {
  country: string;
  cityState: string;
  roadArea: string;
  postalCode: string;
  taxId: string;
}

interface ApiUser {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  username: string;
  dob: string | null;
  gender: string;
  role: string;
  sellerStatus: string;
  bio: string;
  profileImage: string;
  multiProfileImage: string[];
  pdfFile: string;
  otp: string | null;
  otpExpires: string | null;
  refreshToken: string;
  hasActiveSubscription: boolean;
  subscriptionExpireDate: string | null;
  address: Address;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    users: ApiUser[];
    paginationInfo: {
      currentPage: number;
      totalPages: number;
      totalData: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

interface DisplayUser {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  phoneNumber: string;
  totalOrder: number;
  deliveredOrder: number;
  pendingOrder: number;
  cancelOrder: number;
}

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

const fetchUsers = async (page: number = 1): Promise<ApiResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-users?page=${page}`,
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
  return apiUsers.map((user) => ({
    id: user._id,
    userId: user._id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    avatar: user.profileImage || "/placeholder.svg?height=32&width=32",
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber || "N/A",
    totalOrder: Math.floor(Math.random() * 300) + 50,
    deliveredOrder: Math.floor(Math.random() * 200) + 30,
    pendingOrder: Math.floor(Math.random() * 50) + 5,
    cancelOrder: Math.floor(Math.random() * 20) + 1,
  }));
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
        <div>
          <span className="font-medium">{row.name}</span>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (value: string) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "ADMIN"
            ? "bg-red-100 text-red-800"
            : value === "SELLER"
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {value}
      </span>
    ),
  },
  { key: "phoneNumber", label: "Phone" },
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

  const displayUsers = apiResponse ? transformUsers(apiResponse.data.users) : [];
  const paginationInfo = apiResponse?.data.paginationInfo;

  const totalSales = displayUsers.reduce(
    (sum, user) => sum + user.totalOrder * 65.5,
    0
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
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
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  User Profile
                </h1>
                <p className="text-gray-500">Dashboard &gt; User Profile</p>
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
              Showing {displayUsers.length} of{" "}
              {paginationInfo?.totalData || 0} users
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Page {paginationInfo?.currentPage || 1} of{" "}
                {paginationInfo?.totalPages || 1}
              </span>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={displayUsers}
            currentPage={paginationInfo?.currentPage || 1}
            totalPages={paginationInfo?.totalPages || 1}
            totalItems={paginationInfo?.totalData || 0}
            itemsPerPage={displayUsers.length}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

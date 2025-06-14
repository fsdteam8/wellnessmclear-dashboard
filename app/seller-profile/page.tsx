// "use client";

// import { useState } from "react";
// import { DataTable } from "@/components/data-table";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useQuery } from "@tanstack/react-query";

// const TOKEN =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";
// interface Seller {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   profileImage: string;
//   products?: number;
// }

// export default function SellerProfilePage() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const { data, error, isLoading } = useQuery({
//     queryKey: ["sellers", currentPage],
//     queryFn: async () => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-sellers?page=${currentPage}&limit=${itemsPerPage}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//         }
//       );
//       if (!res.ok) {
//         throw new Error("Failed to fetch sellers");
//       }
//       return res.json();
//     },
//   });

//   // If loading or error, render accordingly
//   if (isLoading) return <div>Loading sellers...</div>;
//   if (error) return <div>Error loading sellers.</div>;

//   const sellers: Seller[] = data?.data?.sellers || [];
//   const pagination = data?.data?.paginationInfo || {};

//   const totalItems = pagination.totalData || sellers.length;
//   const totalPages = pagination.totalPages || 1;

//   const columns = [
//     { key: "_id", label: "Seller ID" },
//     {
//       key: "name",
//       label: "Seller Name",
//       render: (_: any, row: Seller) => (
//         <div className="flex items-center space-x-2">
//           <Avatar className="h-8 w-8">
//             <AvatarImage src={row.profileImage || "/placeholder.svg"} />
//             <AvatarFallback>
//               {row.firstName?.[0] || "?"}
//               {row.lastName?.[0] || "?"}
//             </AvatarFallback>
//           </Avatar>
//           <span>{`${row.firstName} ${row.lastName}`}</span>
//         </div>
//       ),
//     },
//     {
//       key: "products",
//       label: "Seller Product",
//       render: () => <span>-</span>, // or actual product count if available
//     },
//     {
//       key: "action",
//       label: "Action",
//       render: () => (
//         <Button
//           variant="outline"
//           size="sm"
//           className="bg-slate-600 text-white hover:bg-slate-700"
//         >
//           Details
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <div className="flex-1 overflow-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <div className="mt-4">
//                 <h1 className="text-2xl font-semibold text-gray-900">
//                   Seller Profile
//                 </h1>
//                 <p className="text-gray-500">Dashboard &gt; Seller Profile</p>
//               </div>
//             </div>
//             <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
//               <CardContent className="p-4">
//                 <div className="space-y-3">
//                   <p className="text-base opacity-90 ml-2">Total Sales</p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
//                     <p className="text-[16px] font-bold">$132,570.00</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <DataTable
//             columns={columns}
//             data={sellers}
//             currentPage={pagination.currentPage || currentPage}
//             totalPages={totalPages}
//             totalItems={totalItems}
//             itemsPerPage={itemsPerPage}
//             onPageChange={setCurrentPage}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDk2MjM3NzQsImV4cCI6MTc1MDIyODU3NH0.sSDAQEhRI6ii7oG05O2mYYaxZoXxFfj0tk52ErnpmSs";

interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  products?: number;
}

interface Column<T> {
  key: string;
  label: string;
  render?: (value: T[keyof T], row: T) => JSX.Element;
}

export default function SellerProfilePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, error, isLoading } = useQuery({
    queryKey: ["sellers", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-sellers?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch sellers");
      }
      return res.json();
    },
  });

  if (isLoading) return <div>Loading sellers...</div>;
  if (error) return <div>Error loading sellers.</div>;

  const sellers: Seller[] = data?.data?.sellers || [];
  const pagination = data?.data?.paginationInfo || {};

  const totalItems = pagination.totalData || sellers.length;
  const totalPages = pagination.totalPages || 1;

  const columns: Column<Seller>[] = [
    { key: "_id", label: "Seller ID" },
    {
      key: "firstName",
      label: "Seller Name",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.profileImage || "/placeholder.svg"} />
            <AvatarFallback>
              {row.firstName?.[0] || "?"}
              {row.lastName?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <span>{`${row.firstName} ${row.lastName}`}</span>
        </div>
      ),
    },
    {
      key: "products",
      label: "Seller Product",
      render: () => <span>-</span>, // Update this if you have actual product count
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-600 text-white hover:bg-slate-700"
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Seller Profile
                </h1>
                <p className="text-gray-500">Dashboard &gt; Seller Profile</p>
              </div>
            </div>
            <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-base opacity-90 ml-2">Total Sales</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
                    <p className="text-[16px] font-bold">$132,570.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            columns={columns}
            data={sellers}
            currentPage={pagination.currentPage || currentPage}
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

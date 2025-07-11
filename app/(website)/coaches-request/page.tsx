// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { DataTable } from "@/components/data-table";
// import { PuffLoader } from "react-spinners";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";

// // Coach interface
// interface Coach {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   email: string;
//   phoneNumber: string;
//   profileImage: string;
//   gender: string;
//   dateOfBirth: string;
//   address: string;
//   specialization: string;
//   description: string;
//   qualification: string;
//   fieldOfExperiences: string;
//   yearsOfExperience: number;
//   certifications: {
//     name: string;
//     file: string;
//   }[];
//   skills: {
//     skillName: string;
//     description: string;
//   }[];
//   servicesOffered: string;
//   accepted: boolean;
//   availability: {
//     day: string;
//     slots: {
//       startTime: string;
//       endTime: string;
//     }[];
//   }[];
//   createdAt: string;
//   updatedAt: string;
// }

// interface ApiResponse {
//   status: boolean;
//   message: string;
//   data: Coach[];
// }

// interface Column<T> {
//   key: string;
//   label: string;
//   render?: (value: T[keyof T], row: T) => JSX.Element;
// }

// export default function CoachRequestsPage() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [processingId, setProcessingId] = useState<string | null>(null);
//   const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
//   const itemsPerPage = 10;

//   const session = useSession();
//   const TOKEN = session?.data?.accessToken;
//   const queryClient = useQueryClient();

//   const { data, error, isLoading } = useQuery<ApiResponse>({
//     queryKey: ["pending-coaches", currentPage],
//     queryFn: async () => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/coach/check-pending-status?page=${currentPage}&limit=${itemsPerPage}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error("Failed to fetch pending coaches");
//       return res.json();
//     },
//     enabled: !!TOKEN,
//   });

//   const updateCoachStatusMutation = useMutation({
//     mutationFn: async ({ coachId, action }: { coachId: string; action: "true" }) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/coach/${coachId}/status`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//           body: JSON.stringify({ accepted: "true" }), // ✅ Correct body
//         }
//       );
//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to ${action} coach`);
//       }
//       return res.json();
//     },
//     onMutate: async ({ coachId, action }) => {
//       setProcessingId(coachId);
//       setActionType(action);
//       await queryClient.cancelQueries({ queryKey: ["pending-coaches", currentPage] });
//       const previousCoaches = queryClient.getQueryData<ApiResponse>(["pending-coaches", currentPage]);
//       queryClient.setQueryData<ApiResponse>(["pending-coaches", currentPage], (old) => {
//         if (!old) return old;
//         return {
//           ...old,
//           data: old.data.filter((coach) => coach._id !== coachId),
//         };
//       });
//       return { previousCoaches };
//     },
//     onError: (err, { action }, context) => {
//       if (context?.previousCoaches) {
//         queryClient.setQueryData(["pending-coaches", currentPage], context.previousCoaches);
//       }
//       toast.error(err.message || `Failed to ${action} coach`);
//       console.error(`${action} error:`, err);
//     },
//     onSuccess: (_, { action }) => {
//       toast.success(`Coach ${action === "approve" ? "approved" : "rejected"} successfully`);
//       queryClient.invalidateQueries({ queryKey: ["pending-coaches"] });

//       const currentCoaches = queryClient.getQueryData<ApiResponse>(["pending-coaches", currentPage]);
//       if (currentCoaches && currentCoaches.data.length === 0 && currentPage > 1) {
//         setCurrentPage(currentPage - 1);
//       }
//     },
//     onSettled: () => {
//       setProcessingId(null);
//       setActionType(null);
//     },
//   });

//   const handleApproveCoach = (coach: Coach) => {
//     const confirmed = window.confirm(`Are you sure you want to approve ${coach.firstName} ${coach.lastName}?`);
//     if (confirmed) {
//       updateCoachStatusMutation.mutate({ coachId: coach._id, action: "approve" });
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <PuffLoader color="rgba(49, 23, 215, 1)" loading speedMultiplier={1} size={60} />
//           <p className="mt-4 text-gray-600">Loading coach requests...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center text-red-500">
//           <p>Error loading coach requests: {error.message}</p>
//           <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const coaches: Coach[] = data?.data || [];
//   const totalItems = coaches.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const columns: Column<Coach>[] = [
//     {
//       key: "firstName",
//       label: "Coach Name",
//       render: (_, row) => (
//         <div className="flex items-center space-x-3">
//           <Avatar className="h-10 w-10">
//             <AvatarImage src={row.profileImage || "/placeholder.svg"} alt={`${row.firstName} ${row.lastName}`} />
//             <AvatarFallback className="bg-blue-100 text-blue-600">
//               {row.firstName?.[0]}
//               {row.lastName?.[0]}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <p className="font-medium text-gray-900">
//               {row.firstName} {row.lastName}
//             </p>
//             <p className="text-sm text-gray-500">{row.specialization}</p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "specialization",
//       label: "Service",
//       render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
//     },
//     {
//       key: "email",
//       label: "Email",
//       render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
//     },
//     {
//       key: "phoneNumber",
//       label: "Phone Number",
//       render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
//     },
//     {
//       key: "actions",
//       label: "Action",
//       render: (_, row) => (
//         <div className="flex items-center space-x-2">
//           <Button
//             size="sm"
//             className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
//             onClick={() => handleApproveCoach(row)}
//             disabled={processingId === row._id}
//           >
//             {processingId === row._id && actionType === "approve" ? (
//               <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
//             ) : (
//               <>Approve</>
//             )}
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="flex h-screen">
//       <div className="flex-1 overflow-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Coach Requests</h1>
//               <p className="text-gray-500">Dashboard &gt; Coach Requests</p>
//             </div>
//             <div className="text-sm text-gray-500">
//               {coaches.length > 0 && (
//                 <span>
//                   Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
//                   {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} requests
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border">
//             {coaches.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-gray-500">No pending coach requests found.</p>
//               </div>
//             ) : (
//               <DataTable
//                 columns={columns}
//                 data={coaches}
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 totalItems={totalItems}
//                 itemsPerPage={itemsPerPage}
//                 onPageChange={setCurrentPage}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { PuffLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Coach interface
interface Coach {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  specialization: string;
  description: string;
  qualification: string;
  fieldOfExperiences: string;
  yearsOfExperience: number;
  certifications: {
    name: string;
    file: string;
  }[];
  skills: {
    skillName: string;
    description: string;
  }[];
  servicesOffered: string;
  accepted: boolean;
  availability: {
    day: string;
    slots: {
      startTime: string;
      endTime: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: Coach[];
}

interface Column<T> {
  key: string;
  label: string;
  render?: (value: T[keyof T], row: T) => JSX.Element;
}

export default function CoachRequestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const session = useSession();
  const TOKEN = session?.data?.accessToken;
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["pending-coaches", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/coach/check-pending-status?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch pending coaches");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const updateCoachStatusMutation = useMutation({
    mutationFn: async ({ coachId }: { coachId: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/coach/${coachId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ accepted: true }), // ✅ CORRECT BOOLEAN
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to approve coach");
      }
      return res.json();
    },
    onMutate: async ({ coachId }) => {
      setProcessingId(coachId);
      await queryClient.cancelQueries({ queryKey: ["pending-coaches", currentPage] });
      const previousCoaches = queryClient.getQueryData<ApiResponse>(["pending-coaches", currentPage]);
      queryClient.setQueryData<ApiResponse>(["pending-coaches", currentPage], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((coach) => coach._id !== coachId),
        };
      });
      return { previousCoaches };
    },
    onError: (err, _, context) => {
      if (context?.previousCoaches) {
        queryClient.setQueryData(["pending-coaches", currentPage], context.previousCoaches);
      }
      toast.error(err.message || "Failed to approve coach");
      console.error("approve error:", err);
    },
    onSuccess: () => {
      toast.success("Coach approved successfully");
      queryClient.invalidateQueries({ queryKey: ["pending-coaches"] });

      const currentCoaches = queryClient.getQueryData<ApiResponse>(["pending-coaches", currentPage]);
      if (currentCoaches && currentCoaches.data.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const handleApproveCoach = (coach: Coach) => {
    const confirmed = window.confirm(`Are you sure you want to approve ${coach.firstName} ${coach.lastName}?`);
    if (confirmed) {
      updateCoachStatusMutation.mutate({ coachId: coach._id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <PuffLoader color="rgba(49, 23, 215, 1)" loading speedMultiplier={1} size={60} />
          <p className="mt-4 text-gray-600">Loading coach requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Error loading coach requests: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const coaches: Coach[] = data?.data || [];
  const totalItems = coaches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<Coach>[] = [
    {
      key: "firstName",
      label: "Coach Name",
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.profileImage || "/placeholder.svg"} alt={`${row.firstName} ${row.lastName}`} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {row.firstName?.[0]}
              {row.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-sm text-gray-500">{row.specialization}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Service",
      render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
            onClick={() => handleApproveCoach(row)}
            disabled={processingId === row._id}
          >
            {processingId === row._id ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>Approve</>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Coach Requests</h1>
              <p className="text-gray-500">Dashboard &gt; Coach Requests</p>
            </div>
            {/* <div className="text-sm text-gray-500">
              {coaches.length > 0 && (
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} requests
                </span>
              )}
            </div> */}
          </div>

          <div className="">
            {coaches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No pending coach requests found.</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={coaches}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

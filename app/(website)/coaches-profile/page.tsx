"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { PuffLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner"; // or your preferred toast library

// Updated interface to match actual API response
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
  certifications: string[];
  skills: {
    "Medical Skills": number;
    "Communication Skills": number;
    "Patients Care": number;
    "Career Overview": number;
  };
  servicesOffered: {
    _id: string;
    title: string;
    description: string;
    price: number;
    // ... other service fields
  };
  accepted: boolean;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    coaches: Coach[];
    pagination: {
      totalCount: number;
      page: number;
      totalPages: number;
    };
  };
}

interface Column<T> {
  key: string;
  label: string;
  render?: (value: T[keyof T], row: T) => JSX.Element;
}

export default function SellerProfilePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const session = useSession();
  const TOKEN = session?.data?.accessToken;
  console.log("token", TOKEN)
  const queryClient = useQueryClient();

  // Fetch list of coaches with pagination
  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["coaches", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/coach/?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch coaches");
      return res.json();
    },
    enabled: !!TOKEN, // Only run query when token is available
  });

  // Delete coach mutation
  const deleteCoachMutation = useMutation({
    mutationFn: async (coachId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/coach/${coachId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete coach");
      }
      
      return res.json();
    },
    onMutate: async (coachId) => {
      // Set loading state for specific coach
      setDeletingId(coachId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["coaches", currentPage] });
      
      // Snapshot the previous value
      const previousCoaches = queryClient.getQueryData<ApiResponse>(["coaches", currentPage]);
      
      // Optimistically update the cache
      queryClient.setQueryData<ApiResponse>(["coaches", currentPage], (old) => {
        if (!old) return old;
        
        return {
          ...old,
          data: {
            ...old.data,
            coaches: old.data.coaches.filter(coach => coach._id !== coachId),
            pagination: {
              ...old.data.pagination,
              totalCount: old.data.pagination.totalCount - 1,
            }
          }
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousCoaches };
    },
    onError: (err, coachId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCoaches) {
        queryClient.setQueryData(["coaches", currentPage], context.previousCoaches);
      }
      
      // Show error toast
      toast.error(err.message || "Failed to delete coach");
      console.error("Delete error:", err);
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Coach deleted successfully");
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      
      // If we're on a page with no items after deletion, go to previous page
      const currentCoaches = queryClient.getQueryData<ApiResponse>(["coaches", currentPage]);
      if (currentCoaches && currentCoaches.data.coaches.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onSettled: () => {
      // Always clear the loading state
      setDeletingId(null);
    },
  });

  // Handle delete with confirmation
  const handleDeleteCoach = async (coach: Coach) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${coach.firstName} ${coach.lastName}? This action cannot be undone.`
    );

    console.log("caoah", coach)
    
    if (confirmed) {
      deleteCoachMutation.mutate(coach._id);
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Error loading coaches: {error.message}</p>
        </div>
      </div>
    );
  }

  const coaches: Coach[] = data?.data?.coaches || [];
  const totalItems = data?.data?.pagination?.totalCount || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const columns: Column<Coach>[] = [
    {
      key: "firstName",
      label: "Coach Name",
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={row.profileImage || "/placeholder.svg"}
              alt={`${row.firstName} ${row.lastName}`}
            />
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
      key: "email",
      label: "Email",
      render: (value) => (
        <span className="text-sm text-gray-600">{String(value)}</span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value) => (
        <span className="text-sm text-gray-600">{String(value)}</span>
      ),
    },
    {
      key: "Details",
      label: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete"
            onClick={() => handleDeleteCoach(row)}
            disabled={deletingId === row._id || deleteCoachMutation.isPending}
          >
            {deletingId === row._id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
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
              <h1 className="text-2xl font-semibold text-gray-900">
                Coach Profiles
              </h1>
              <p className="text-gray-500">Dashboard &gt; Coach Profiles</p>
            </div>
          </div>

          <div className="">
            <DataTable
              columns={columns}
              data={coaches}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
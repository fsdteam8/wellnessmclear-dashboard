"use client";

import { useState } from "react";
// import { DataTable } from "@/components/data-table";
// import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { PuffLoader } from "react-spinners";
import { useSession } from "next-auth/react";


interface Seller {
  id: string;
  name: string;
  profileImage: string;
  SellerProduct: number;
}


interface Column<T> {
  key: string;
  label: string;
  render?: (value: T[keyof T], row: T) => JSX.Element;
}

export default function SellerProfilePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);



const session = useSession();
  const TOKEN = session?.data?.accessToken;
  // Fetch list of sellers with pagination using object syntax for useQuery
  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["sellers", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-sellerProfiles?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch sellers");
      return res.json();
    },
  });

  // Fetch single seller details when selectedSellerId changes, also using object syntax
  const {
    data: sellerDetailsData,
    isLoading: isSellerLoading,
    error: sellerError,
  } = useQuery({
    queryKey: ["sellerDetails", selectedSellerId],
    queryFn: async () => {
      if (!selectedSellerId) return null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/all-sellerProfiles/${selectedSellerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch seller details");
      const result = await res.json();
      return result.data;
    },
    enabled: !!selectedSellerId,
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <PuffLoader
      color="rgba(49, 23, 215, 1)"
      loading
      speedMultiplier={1}
      size={60}
    />
  </div>
</div>
  if (error) return <div>Error loading sellers.</div>;

  const sellers: Seller[] = data?.data || [];
  const totalItems = data?.totalItems || 0; // backend should provide total count
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<Seller>[] = [
    { key: "id", label: "Seller ID" },
    {
      key: "name",
      label: "Seller Name",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.profileImage || "/placeholder.svg"} />
            <AvatarFallback>{row.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: "SellerProduct",
      label: "Seller Product",
      render: (_, row) => <span>{row.SellerProduct}</span>,
    },
    {
      key: "Details",
      label: "Details",
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-600 text-white hover:bg-slate-700"
          onClick={() => {
            setSelectedSellerId(row.id);
            setOpenModal(true);
          }}
        >
          View
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
                <h1 className="text-2xl font-semibold text-gray-900">Seller Profile</h1>
                <p className="text-gray-500">Dashboard &gt; Seller Profile</p>
              </div>
            </div>
            <Card className="bg-[#525773] text-white w-[259px] rounded-[8px]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-base opacity-90 ml-2">Total Seller Products</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#09B850] rounded-full"></div>
                    <p className="text-[16px] font-bold">
                      {sellers.reduce((sum, seller) => sum + seller.SellerProduct, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            columns={columns}
            data={sellers}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />

          {/* Modal for Seller Details */}
          <Dialog
            open={openModal}
            onOpenChange={(open) => {
              setOpenModal(open);
              if (!open) setSelectedSellerId(null); // reset when modal closes
            }}
          >
            <DialogContent>
              {isSellerLoading ? (
                <p>Loading seller details...</p>
              ) : sellerError ? (
                <p>Error loading seller details.</p>
              ) : sellerDetailsData ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{sellerDetailsData?.name}</h2>
                  <p>
                    <strong>Email:</strong> {sellerDetailsData?.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {sellerDetailsData?.role}
                  </p>
                  <p>
                    <strong>Total Products:</strong> {sellerDetailsData?.totalProducts}
                  </p>
                  <p>
                    <strong>Phone:</strong> {sellerDetailsData?.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Bio:</strong> {sellerDetailsData?.bio || "N/A"}
                  </p>
                </div>
              ) : (
                <p>No details available.</p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

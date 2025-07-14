/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";

// API function to fetch revenue data using token
const fetchRevenueData = async (token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/booking/earnings`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch revenue data");
  }

  return response.json();
};


// Revenue Table Component
const RevenueTable = () => {
  const { data: session, status } = useSession();
  const token = session?.accessToken || "";

  const {
    data: revenueData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["revenue-earnings"],
    queryFn: () => fetchRevenueData(token),
    enabled: status === "authenticated" && !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });


  console.log(revenueData?.payments)


  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white">
            <div className="px-8 py-6">
              <h1 className="text-2xl font-semibold text-black mb-2">
                Revenue from Seller
              </h1>
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>›</span>
                <span className="text-gray-500">Revenue from Seller</span>
              </nav>
            </div>

            <div className="px-8 py-6">
              <div className="animate-pulse">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 mb-3">
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">
                ⚠️ Error Loading Data
              </div>
              <p className="text-gray-600 mb-4">{error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="">
          {/* Header Section */}

          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-black mb-2">
              Revenue from Seller
            </h1>
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-gray-500">Revenue from Seller</span>
            </nav>
          </div>

          {/* Table Section */}
          <div className="px-8 pb-8">
            <Card className="h-[120px] lg:w-[470px] w-full shadow-[0px_2px_6px_0px_#00000014] lg:mb-6 mb-4 bg-[#CBA0E3] rounded-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-[20px] font-bold text-white">
                      Total Revenue
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                      <p className="text-base font-medium text-white">
                         {(Number(revenueData?.totalPlatformEarning || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="">
                    <th className="text-left text-sm font-medium text-gray-700 py-4 px-6">
                      Doctor Name
                    </th>
                    <th className="text-left text-sm font-medium text-gray-700 py-4 px-6">
                      Service Name
                    </th>
                    <th className="text-right text-sm font-medium text-gray-700 py-4 px-6">
                      Revenue from Doctor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData?.payments?.length > 0 ? (
                    revenueData.payments.map((payment: any, index: any) => (
                      <tr
                        key={`${payment.paymentId}-${index}`}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-7 px-6 text-base text-gray-900">
                          {payment.booking?.coach?.firstName|| "N/A"}
                        </td>
                        <td className="py-7 px-6 text-base text-gray-900">
                          {payment.booking?.service?.description || "N/A"}
                        </td>
                        <td className="py-7 px-6 text-base text-gray-900 text-right">
                          ${payment.splitAmount || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-12 px-6 text-center text-gray-500"
                      >
                        No revenue data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTable;

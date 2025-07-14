/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";
import Image from "next/image";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  savedPrice: number;
  image: string;
  category: string;
  subCategory: string;
  brand: string;
  countInStock: number;
  createdAt: string;
}

interface ProductItem {
  product: Product;
  quantity: number;
  _id: string;
}

interface Payment {
  _id: string;
  userId: string;
  product: ProductItem[];
  amount: number;
  currency: string;
  type: string;
  paymentIntentId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    count: number;
    payments: Payment[];
    totalAmount: number;
  };
}

export default function OrderHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;
  const { data: session } = useSession();
  const TOKEN = session?.accessToken || "";

  const fetchOrderData = async (): Promise<ApiResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/all-orders`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch order data");
    return response.json();
  };

  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order-data"],
    queryFn: fetchOrderData,
    enabled: !!TOKEN,
  });

  const updateMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/status/${paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ status: "failed" }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Update failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment status updated to 'Cancelled'");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update payment");
    },
  });

  const payments = orderData?.data?.payments || [];
  const totalItems = payments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = payments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      succeeded: { color: "bg-green-100 text-green-800", label: "Approved" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      failed: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const { color, label } =
      statusMap[status as keyof typeof statusMap] || statusMap.succeeded;

    return <Badge className={`${color}`}>{label}</Badge>;
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };

  const getTotalProductsCount = (products: ProductItem[]) => {
    return products.reduce((total, item) => total + item.quantity, 0);
  };

  const getProductNames = (products: ProductItem[]) => {
    return products.map((item) => item.product?.name).join(", ");
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-red-600">
              Error loading order data: {(error as Error).message}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order History</h1>
      <p className="text-gray-600 mb-6">
        <span className="text-blue-600">Dashboard</span> &gt; Order History
      </p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-medium text-gray-900">
                  Payment ID
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Products
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Amount
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Items
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Date
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Status
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
  <td colSpan={7}>
    <div className="flex justify-center items-center py-12">
      <PuffLoader color="rgba(49, 23, 215, 1)" size={60} />
    </div>
  </td>
</tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((payment) => (
                  <tr key={payment._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-900 font-mono text-sm">
                      {payment._id.slice(-8)}
                    </td>
                    <td className="p-4 text-gray-900 max-w-xs truncate">
                      {getProductNames(payment?.product)}
                    </td>
                    <td className="p-4 text-gray-900 font-semibold">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-900">
                      {getTotalProductsCount(payment.product)} items
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="p-4">{getStatusBadge(payment.status)}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewPayment(payment)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMutation.mutate(payment._id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPaginationNumbers().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  disabled={page === "..."}
                  onClick={() =>
                    typeof page === "number" && setCurrentPage(page)
                  }
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Payment Details - {selectedPayment._id.slice(-8)}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-mono text-sm">{selectedPayment._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">
                  ${selectedPayment.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-1">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p>{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <div className="space-y-4">
              {selectedPayment.product.map((item) => (
                <div key={item._id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={item?.product?.image}
                        alt={item?.product?.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item?.product?.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item?.product?.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Quantity</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price</p>
                          <p className="font-medium">
                            ${item?.product?.discountedPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium">
                            $
                            {(
                              item?.product?.discountedPrice * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Brand</p>
                          <p className="font-medium">{item?.product?.brand}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={closeModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

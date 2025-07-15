"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";
import Image from "next/image";

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

interface OrderItem {
  id: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
  address: string;
  date: string;
  status: string;
}

export default function OrderHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
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

  const transformedData: OrderItem[] = [];
  orderData?.data?.payments?.forEach((payment) => {
    payment.product.forEach((productItem) => {
      transformedData.push({
        id: `${payment._id}-${productItem._id}`,
        productName: productItem?.product?.name,
        image: productItem?.product?.image,
        price: productItem?.product?.discountedPrice,
        quantity: productItem?.quantity,
        address: "2372 Westheimer Rd. Santa Ana, Illinois 85486",
        date:
          new Date(payment.createdAt).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }) +
          " " +
          new Date(payment.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        status: payment.status,
      });
    });
  });

  const filteredData = transformedData.filter((item) =>
    item?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My-Wallet</h1>
      <p className="text-gray-600 mb-6">
        <span className="text-blue-600">Dashboard</span> &gt;My-Wallet
      </p>

      {/* Revenue Card */}
      <Card className="h-[120px] lg:w-[470px] w-full shadow-[0px_2px_6px_0px_#00000014] lg:mb-6 mb-4 bg-[#CBA0E3] rounded-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-[20px] font-bold text-white">Total Revenue</p>
              <div className="flex items-center space-x-2">
                <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                <p className="text-base font-medium text-white">
                  {orderData?.data?.totalAmount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Input */}
      <div className="mb-4 lg:w-[470px] w-full">
        <label className="text-[18px] text-[#131313]">Sales History</label>
        <Input
          placeholder="Search by product name..."
          value={searchTerm}
          className="mt-3 h-[45px] border border-[#CBA0E3]"
          onChange={(e) => {
            setCurrentPage(1); // reset to page 1 on new search
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {/* Order Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-medium text-gray-900">
                  Product Name
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Price
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Quantity
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Address
                </th>
                <th className="p-4 text-left font-medium text-gray-900">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
  <td colSpan={5} className="py-8">
    <div className="flex justify-center items-center">
      <PuffLoader color="rgba(49, 23, 215, 1)" size={60} />
    </div>
  </td>
</tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.productName.slice(0,30)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-900">{item.quantity}</td>
                    <td className="p-4 text-gray-600">{item.address}</td>
                    <td className="p-4 text-gray-600">{item.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No matching products found.
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
    </div>
  );
}

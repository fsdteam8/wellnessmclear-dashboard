"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Image from "next/image";
// import { SquareArrowOutUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";
import Link from "next/link";

// Extend Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

type DashboardSummary = {
  liveProducts: number;
  newProducts: {
    thisDay: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  ownRevenue: number;
  productSell: {
    name: string;
    percentage: number;
  }[];
  totalRevenue: number;
  totalSellers: number;
  totalUsers: number;
};

// Colors for pie chart
const pieColors = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#f97316",
];

export default function Dashboard() {
  const session = useSession();
  console.log("session", session);

  const TOKEN = session?.data?.accessToken;

  const [selectedPeriod, setSelectedPeriod] = useState<
    "thisDay" | "thisWeek" | "thisMonth" | "thisYear"
  >("thisMonth");

  const [selectedOwnRevenuePeriod, setSelectedOwnRevenuePeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");

  // Separate state for Own Revenue Report period
  const [selectedOwnRevenueReportPeriod, setSelectedOwnRevenueReportPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      if (!TOKEN) throw new Error("No token available");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/dashboard-summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard summary");
      }

      return res.json();
    },
    enabled: !!TOKEN,
  });

  // Query for Own Revenue Ratio (revenue data)
  const { data: ownRevenueData } = useQuery({
    queryKey: ["Revenue-Ratio", selectedOwnRevenuePeriod],
    queryFn: async () => {
      if (!TOKEN) throw new Error("No token available");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/own-revenue-report?filter=${selectedOwnRevenuePeriod}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch own revenue data");
      }

      return res.json();
    },
    enabled: !!TOKEN,
  });

  // Query for Own Revenue Report (ratio data)
  const { data: ownRevenueReportData } = useQuery({
    queryKey: ["Revenue-Report", selectedOwnRevenueReportPeriod],
    queryFn: async () => {
      if (!TOKEN) throw new Error("No token available");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/own-revenue-report?filter=${selectedOwnRevenueReportPeriod}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch own revenue report data");
      }

      return res.json();
    },
    enabled: !!TOKEN,
  });

  // Data extraction
  const ownRevenueChartData = ownRevenueData?.data?.breakdown || [];
  const ownRevenueReportChartData = ownRevenueReportData?.data?.breakdown || [];
  const summaryData: DashboardSummary = data?.data || {};

  const getCurrentPeriodData = () => {
    const periodData = {
      thisDay: {
        value: summaryData.newProducts?.thisDay || 0,
        label: "This Day",
      },
      thisWeek: {
        value: summaryData.newProducts?.thisWeek || 0,
        label: "This Week",
      },
      thisMonth: {
        value: summaryData.newProducts?.thisMonth || 0,
        label: "This Month",
      },
      thisYear: {
        value: summaryData.newProducts?.thisYear || 0,
        label: "This Year",
      },
    };
    return periodData[selectedPeriod];
  };

  // Transform data for Own Revenue Ratio chart (month vs revenue)
  const transformedOwnRevenueData = ownRevenueChartData.map(
    (
      item: {
        date?: string;
        day?: string;
        month?: string;
        year?: string;
        revenue: number;
        ratio?: number;
      }
    ) => {
      let dateKey;

      switch (selectedOwnRevenuePeriod) {
        case "day":
          dateKey = item.date || item.month;
          break;
        case "week":
          dateKey = item.day || item.month;
          break;
        case "month":
          dateKey = item.month;
          break;
        case "year":
          dateKey = item.year || item.month;
          break;
        default:
          dateKey = item.month;
      }

      return {
        date: dateKey,
        revenue: item.revenue || 0,
        ratio: item.ratio || 0,
      };
    }
  );

  // Transform data for Own Revenue Report chart (month vs ratio)
  const transformedOwnRevenueReportData = ownRevenueReportChartData.map(
    (
      item: {
        date?: string;
        day?: string;
        month?: string;
        year?: string;
        revenue: number;
        ratio?: number;
      }
    ) => {
      let dateKey;

      switch (selectedOwnRevenueReportPeriod) {
        case "day":
          dateKey = item.date || item.month;
          break;
        case "week":
          dateKey = item.day || item.month;
          break;
        case "month":
          dateKey = item.month;
          break;
        case "year":
          dateKey = item.year || item.month;
          break;
        default:
          dateKey = item.month;
      }

      return {
        date: dateKey,
        revenue: item.revenue || 0,
        ratio: item.ratio || 0,
      };
    }
  );

  // Transform product sell data for pie chart
  const productSellData =
    summaryData.productSell?.map((item, index) => ({
      name: item.name,
      value: item.percentage,
      color: pieColors[index % pieColors.length],
    })) || [];

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <PuffLoader
            color="rgba(49, 23, 215, 1)"
            cssOverride={{}}
            loading
            speedMultiplier={1}
          />
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">
          Error: {(error as Error).message}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-gray-500">Dashboard &gt; Overview</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-[20px] font-bold text-[#131313]">
                    Total Revenue
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                    <p className="text-base font-medium text-[#424242]">
                      ${summaryData.totalRevenue?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  <Image
                    src="/images/dassbardHeaderIcon-5.png"
                    alt="Total Revenue"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-[20px] font-bold text-[#131313]">
                    Own Revenue
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                    <p className="text-base font-medium text-[#424242]">
                      ${summaryData.ownRevenue?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  <Image
                    src="/images/dassbardHeaderIcon-4.png"
                    alt="Own Revenue"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-[20px] font-bold text-[#131313]">
                    Live Product
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                    <p className="text-base font-medium text-[#424242]">
                      {summaryData.liveProducts?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  <Image
                    src="/images/dassbardHeaderIcon-3.png"
                    alt="Live Products"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-[20px] font-bold text-[#131313]">
                    Total User
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                    <p className="text-base font-medium text-[#424242]">
                      {summaryData.totalUsers?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  <Image
                    src="/images/dassbardHeaderIcon-1.png"
                    alt="Total Users"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Own Revenue Ratio - Shows month vs revenue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Own Revenue Ratio
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant={
                      selectedOwnRevenuePeriod === "day" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedOwnRevenuePeriod("day")}
                    className="h-8 px-3 text-xs"
                  >
                    Day
                  </Button>
                  <Button
                    variant={
                      selectedOwnRevenuePeriod === "week"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedOwnRevenuePeriod("week")}
                    className="h-8 px-3 text-xs"
                  >
                    Week
                  </Button>
                  <Button
                    variant={
                      selectedOwnRevenuePeriod === "month"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedOwnRevenuePeriod("month")}
                    className="h-8 px-3 text-xs"
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {transformedOwnRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={transformedOwnRevenueData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px]">
                  <p className="text-gray-500 text-sm">Loading chart data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between gap-2">
                <div className="font-semibold">Products Report</div>

                <div className="flex space-x-2 flex-shrink-0">
                  <Button
                    variant={
                      selectedPeriod === "thisDay" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedPeriod("thisDay")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={
                      selectedPeriod === "thisWeek" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedPeriod("thisWeek")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={
                      selectedPeriod === "thisMonth" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedPeriod("thisMonth")}
                  >
                    Month
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="20"
                      strokeDasharray="502"
                      strokeDashoffset={
                        502 -
                        (getCurrentPeriodData().value /
                          Math.max(summaryData.newProducts?.thisYear || 1, 1)) *
                          502
                      }
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {getCurrentPeriodData().value}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCurrentPeriodData().label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Sell */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Product Sell</CardTitle>
                <Link href="/resource-list">
                  {/* <Button className="text-[#3B82F6]" variant="link" size="sm">
                    View Details
                    <span>
                      <SquareArrowOutUpRight />
                    </span>
                  </Button> */}
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={productSellData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {productSellData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {productSellData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.name}</span>
                    </div>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Own Revenue Report - Shows month vs ratio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Own Revenue Report
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant={
                    selectedOwnRevenueReportPeriod === "day" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedOwnRevenueReportPeriod("day")}
                  className="h-8 px-3 text-xs"
                >
                  Day
                </Button>
                <Button
                  variant={
                    selectedOwnRevenueReportPeriod === "week" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedOwnRevenueReportPeriod("week")}
                  className="h-8 px-3 text-xs"
                >
                  Week
                </Button>
                <Button
                  variant={
                    selectedOwnRevenueReportPeriod === "month" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedOwnRevenueReportPeriod("month")}
                  className="h-8 px-3 text-xs"
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {transformedOwnRevenueReportData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={transformedOwnRevenueReportData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="#CBA0E3"
                    strokeWidth={3}
                    dot={{ fill: "#CBA0E3", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px]">
                <p className="text-gray-500 text-sm">Loading chart data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
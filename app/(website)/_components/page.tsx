// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import Image from "next/image";
// import { SquareArrowOutUpRight } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { PuffLoader } from "react-spinners";
// import Link from "next/link";

// // Extend Session type to include accessToken
// // import type { Session } from "next-auth"

// declare module "next-auth" {
//   interface Session {
//     accessToken: string;
//   }
// }

// type DashboardSummary = {
//   liveProducts: number;
//   newProducts: {
//     thisDay: number;
//     thisWeek: number;
//     thisMonth: number;
//     thisYear: number;
//   };
//   ownRevenue: number;
//   productSell: {
//     name: string;
//     percentage: number;
//   }[];
//   totalRevenue: number;
//   totalSellers: number;
//   totalUsers: number;
// };

// // Colors for pie chart
// const pieColors = [
//   "#8b5cf6",
//   "#06b6d4",
//   "#f59e0b",
//   "#10b981",
//   "#ef4444",
//   "#f97316",
// ];

// export default function Dashboard() {
//   const session = useSession();
//   console.log("session", session);

//   // const TOKEN = session?.data?.accessToken;
//   const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODYzODNkOGUwNmVlZTE4Mzg3ZmU0YjAiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1MTM1MjM2MCwiZXhwIjoxNzUyNjQ4MzYwfQ.eD__xJOgkOUyJqExQg7fUuHb5dqPA970UkN3aT9ZzuM"

//   const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState<
//     "day" | "week" | "month" | "year"
//   >("month");

//   const [selectedPeriod, setSelectedPeriod] = useState<
//     "thisDay" | "thisWeek" | "thisMonth" | "thisYear"
//   >("thisMonth");

//   const [selectedOwnRevenuePeriod, setSelectedOwnRevenuePeriod] = useState<
//     "day" | "week" | "month" | "year"
//   >("month");

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ["dashboard-summary"],
//     queryFn: async () => {
//       if (!TOKEN) throw new Error("No token available");

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard/dashboard-summary`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch dashboard summary");
//       }

//       return res.json();
//     },
//     enabled: !!TOKEN,
//   });

//   const { data: ownCardData } = useQuery({
//     queryKey: ["Revenue-Ratio", selectedOwnRevenuePeriod],
//     queryFn: async () => {
//       if (!TOKEN) throw new Error("No token available");

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard/own-revenue-report?filter=${selectedOwnRevenuePeriod}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch own revenue data");
//       }

//       return res.json();
//     },
//     enabled: !!TOKEN,
//   });

//   const { data: totalRevenue } = useQuery({
//     queryKey: ["Revenue-total", selectedRevenuePeriod],
//     queryFn: async () => {
//       if (!TOKEN) throw new Error("No token available");

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard/revenue-report?filter=${selectedRevenuePeriod}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch own revenue data");
//       }

//       return res.json();
//     },
//     enabled: !!TOKEN,
//   });

//   const ownChatData = ownCardData?.data || [];
//   const totalRevenueData = totalRevenue?.data || [];
//   const summaryData: DashboardSummary = data?.data || {};

//   const getCurrentPeriodData = () => {
//     const periodData = {
//       thisDay: {
//         value: summaryData.newProducts?.thisDay || 0,
//         label: "This Day",
//       },
//       thisWeek: {
//         value: summaryData.newProducts?.thisWeek || 0,
//         label: "This Week",
//       },
//       thisMonth: {
//         value: summaryData.newProducts?.thisMonth || 0,
//         label: "This Month",
//       },
//       thisYear: {
//         value: summaryData.newProducts?.thisYear || 0,
//         label: "This Year",
//       },
//     };
//     return periodData[selectedPeriod];
//   };

//   // Transform the own revenue data for the chart based on selected period
//   const transformedOwnRevenueData = ownChatData.map(
//     (
//       item: {
//         date?: string;
//         day?: string;
//         month?: string;
//         year?: string;
//         revenue: number;
//       },
//       index: number
//     ) => {
//       let dateKey;

//       switch (selectedOwnRevenuePeriod) {
//         case "day":
//           dateKey = item.date;
//           break;
//         case "week":
//           dateKey = item.day;
//           break;
//         case "month":
//           dateKey = item.month;
//           break;
//         case "year":
//           dateKey = item.year;
//           break;
//         default:
//           dateKey = item.month;
//       }

//       return {
//         date: dateKey,
//         revenue: item.revenue,
//         previousRevenue: index > 0 ? ownChatData[index - 1].revenue : 0,
//       };
//     }
//   );

//   // Transform product sell data for pie chart
//   const productSellData =
//     summaryData.productSell?.map((item, index) => ({
//       name: item.name,
//       value: item.percentage,
//       color: pieColors[index % pieColors.length],
//     })) || [];

//   if (isLoading)
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-50">
//         <div className="text-center">
//           {/* Optional: Remove this if you only want MoonLoader */}
//           {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div> */}
//           <PuffLoader
//             color="rgba(49, 23, 215, 1)"
//             cssOverride={{}}
//             loading
//             speedMultiplier={1}
//           />
//         </div>
//       </div>
//     );
//   if (isError)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p className="text-lg text-red-500">
//           Error: {(error as Error).message}
//         </p>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-semibold text-gray-900">Over View</h1>
//           <p className="text-gray-500">Dashboard</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-3">
//                   <p className="text-[20px] font-bold text-[#131313]">
//                     Total Revenue
//                   </p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
//                     <p className="text-base font-medium text-[#424242]">
//                       ${summaryData.totalRevenue?.toLocaleString() || "0"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="h-12 w-12 flex items-center justify-center">
//                   <Image
//                     src="/images/dassbardHeaderIcon-5.png"
//                     alt="Total Revenue"
//                     width={100}
//                     height={100}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-3">
//                   <p className="text-[20px] font-bold text-[#131313]">
//                     Own Revenue
//                   </p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
//                     <p className="text-base font-medium text-[#424242]">
//                       ${summaryData.ownRevenue?.toLocaleString() || "0"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="h-12 w-12 flex items-center justify-center">
//                   <Image
//                     src="/images/dassbardHeaderIcon-4.png"
//                     alt="Own Revenue"
//                     width={100}
//                     height={100}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-3">
//                   <p className="text-[20px] font-bold text-[#131313]">
//                     Live Product
//                   </p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
//                     <p className="text-base font-medium text-[#424242]">
//                       {summaryData.liveProducts?.toLocaleString() || "0"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="h-12 w-12 flex items-center justify-center">
//                   <Image
//                     src="/images/dassbardHeaderIcon-3.png"
//                     alt="Live Products"
//                     width={100}
//                     height={100}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-3">
//                   <p className="text-[20px] font-bold text-[#131313]">
//                     Total Seller
//                   </p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
//                     <p className="text-base font-medium text-[#424242]">
//                       {summaryData.totalSellers?.toLocaleString() || "0"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="h-12 w-12 flex items-center justify-center">
//                   <Image
//                     src="/images/dassbardHeaderIcon-2.png"
//                     alt="Total Sellers"
//                     width={100}
//                     height={100}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-3">
//                   <p className="text-[20px] font-bold text-[#131313]">
//                     Total User
//                   </p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
//                     <p className="text-base font-medium text-[#424242]">
//                       {summaryData.totalUsers?.toLocaleString() || "0"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="h-12 w-12 flex items-center justify-center">
//                   <Image
//                     src="/images/dassbardHeaderIcon-1.png"
//                     alt="Total Users"
//                     width={100}
//                     height={100}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           {/* Own Revenue Ratio - Now using API data with working buttons */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-lg font-semibold">
//                   Own Revenue Ratio
//                 </CardTitle>
//                 <div className="flex space-x-1">
//                   <Button
//                     variant={
//                       selectedOwnRevenuePeriod === "day" ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedOwnRevenuePeriod("day")}
//                     className="h-8 px-3 text-xs"
//                   >
//                     Day
//                   </Button>
//                   <Button
//                     variant={
//                       selectedOwnRevenuePeriod === "week"
//                         ? "default"
//                         : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedOwnRevenuePeriod("week")}
//                     className="h-8 px-3 text-xs"
//                   >
//                     Week
//                   </Button>
//                   <Button
//                     variant={
//                       selectedOwnRevenuePeriod === "month"
//                         ? "default"
//                         : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedOwnRevenuePeriod("month")}
//                     className="h-8 px-3 text-xs"
//                   >
//                     Month
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-2">
//               {ownChatData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height={220}>
//                   <LineChart
//                     data={transformedOwnRevenueData}
//                     margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis
//                       dataKey="date"
//                       axisLine={false}
//                       tickLine={false}
//                       tick={{ fontSize: 12, fill: "#666" }}
//                     />
//                     <YAxis
//                       axisLine={false}
//                       tickLine={false}
//                       tick={{ fontSize: 12, fill: "#666" }}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="revenue"
//                       stroke="#8b5cf6"
//                       strokeWidth={3}
//                       dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
//                       activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex items-center justify-center h-[220px]">
//                   <p className="text-gray-500 text-sm">Loading chart data...</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center justify-between gap-2">
//                 <div className="font-semibold">Products Report</div>

//                 <div className="flex space-x-2 flex-shrink-0">
//                   <Button
//                     variant={
//                       selectedPeriod === "thisDay" ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedPeriod("thisDay")}
//                   >
//                     Day
//                   </Button>
//                   <Button
//                     variant={
//                       selectedPeriod === "thisWeek" ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedPeriod("thisWeek")}
//                   >
//                     Week
//                   </Button>
//                   <Button
//                     variant={
//                       selectedPeriod === "thisMonth" ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedPeriod("thisMonth")}
//                   >
//                     Month
//                   </Button>
//                   {/* <Button
//                     variant={
//                       selectedPeriod === "thisYear" ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedPeriod("thisYear")}
//                   >
//                     Year
//                   </Button> */}
//                 </div>
//               </CardTitle>
//             </CardHeader>

//             <CardContent>
//               <div className="h-48 flex items-center justify-center">
//                 <div className="relative">
//                   <svg width="200" height="200" viewBox="0 0 200 200">
//                     <circle
//                       cx="100"
//                       cy="100"
//                       r="80"
//                       fill="none"
//                       stroke="#e5e7eb"
//                       strokeWidth="20"
//                     />
//                     <circle
//                       cx="100"
//                       cy="100"
//                       r="80"
//                       fill="none"
//                       stroke="#8b5cf6"
//                       strokeWidth="20"
//                       strokeDasharray="502"
//                       strokeDashoffset={
//                         502 -
//                         (getCurrentPeriodData().value /
//                           Math.max(summaryData.newProducts?.thisYear || 1, 1)) *
//                           502
//                       }
//                       transform="rotate(-90 100 100)"
//                     />
//                   </svg>
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold">
//                         {getCurrentPeriodData().value}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {getCurrentPeriodData().label}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Product Sell */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-lg">Product Sell</CardTitle>
//                 <Link href="/resource-list">
//                   <Button className="text-[#3B82F6]" variant="link" size="sm">
//                     View Details
//                     <span>
//                       <SquareArrowOutUpRight />
//                     </span>
//                   </Button>
//                 </Link>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={productSellData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={40}
//                     outerRadius={80}
//                     dataKey="value"
//                   >
//                     {productSellData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="mt-4 space-y-2">
//                 {productSellData.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <div className="flex items-center">
//                       <div
//                         className="w-3 h-3 rounded-full mr-2"
//                         style={{ backgroundColor: item.color }}
//                       ></div>
//                       <span>{item.name}</span>
//                     </div>
//                     <span>{item.value}%</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Revenue Report - Updated to use API data */}
//         <Card>
//           <CardHeader>
//             <div className="flex justify-between items-center">
//               <CardTitle className="text-lg">Revenue report</CardTitle>
//               <div className="flex gap-6">
//                 <div className="flex items-center text-sm">
//                   <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
//                   <span>Current Period</span>
//                 </div>
//               </div>
//               <div className="flex space-x-2">
//                 <Button
//                   variant={
//                     selectedRevenuePeriod === "day" ? "default" : "outline"
//                   }
//                   size="sm"
//                   onClick={() => setSelectedRevenuePeriod("day")}
//                 >
//                   Day
//                 </Button>
//                 <Button
//                   variant={
//                     selectedRevenuePeriod === "week" ? "default" : "outline"
//                   }
//                   size="sm"
//                   onClick={() => setSelectedRevenuePeriod("week")}
//                 >
//                   Week
//                 </Button>
//                 <Button
//                   variant={
//                     selectedRevenuePeriod === "month" ? "default" : "outline"
//                   }
//                   size="sm"
//                   onClick={() => setSelectedRevenuePeriod("month")}
//                 >
//                   Month
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {totalRevenueData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={totalRevenueData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis
//                     dataKey={
//                       selectedRevenuePeriod === "day"
//                         ? "date"
//                         : selectedRevenuePeriod === "week"
//                         ? "day"
//                         : selectedRevenuePeriod === "month"
//                         ? "month"
//                         : "year"
//                     }
//                   />
//                   <YAxis />
//                   <Line
//                     type="monotone"
//                     dataKey="revenue"
//                     stroke="#8b5cf6"
//                     strokeWidth={3}
//                     strokeDasharray="5 5"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-[300px]">
//                 <p className="text-gray-500">Loading revenue data...</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
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
import { SquareArrowOutUpRight } from "lucide-react";

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

// Dummy data
const summaryData: DashboardSummary = {
  liveProducts: 1245,
  newProducts: {
    thisDay: 15,
    thisWeek: 87,
    thisMonth: 324,
    thisYear: 2156,
  },
  ownRevenue: 45780,
  productSell: [
    { name: "Electronics", percentage: 35 },
    { name: "Clothing", percentage: 25 },
    { name: "Books", percentage: 20 },
  ],
  totalRevenue: 123456,
  totalSellers: 567,
  totalUsers: 8934,
};

const ownRevenueData = {
  day: [
    { date: "01", revenue: 1200 },
    { date: "02", revenue: 1500 },
    { date: "03", revenue: 1100 },
    { date: "04", revenue: 1800 },
    { date: "05", revenue: 1400 },
    { date: "06", revenue: 1900 },
    { date: "07", revenue: 1600 },
  ],
  week: [
    { day: "Mon", revenue: 5200 },
    { day: "Tue", revenue: 6500 },
    { day: "Wed", revenue: 4100 },
    { day: "Thu", revenue: 7800 },
    { day: "Fri", revenue: 5400 },
    { day: "Sat", revenue: 8900 },
    { day: "Sun", revenue: 6600 },
  ],
  month: [
    { month: "Jan", revenue: 15200 },
    { month: "Feb", revenue: 18500 },
    { month: "Mar", revenue: 16100 },
    { month: "Apr", revenue: 19800 },
    { month: "May", revenue: 17400 },
    { month: "Jun", revenue: 21900 },
    { month: "Jul", revenue: 19600 },
    { month: "Aug", revenue: 22300 },
    { month: "Sep", revenue: 20800 },
    { month: "Oct", revenue: 23400 },
    { month: "Nov", revenue: 21200 },
    { month: "Dec", revenue: 25600 },
  ],
  year: [
    { year: "2019", revenue: 120000 },
    { year: "2020", revenue: 135000 },
    { year: "2021", revenue: 148000 },
    { year: "2022", revenue: 162000 },
    { year: "2023", revenue: 178000 },
    { year: "2024", revenue: 195000 },
  ],
};

const totalRevenueData = {
  day: [
    { date: "01", revenue: 2200 },
    { date: "02", revenue: 2500 },
    { date: "03", revenue: 2100 },
    { date: "04", revenue: 2800 },
    { date: "05", revenue: 2400 },
    { date: "06", revenue: 2900 },
    { date: "07", revenue: 2600 },
  ],
  week: [
    { day: "Mon", revenue: 8200 },
    { day: "Tue", revenue: 9500 },
    { day: "Wed", revenue: 7100 },
    { day: "Thu", revenue: 10800 },
    { day: "Fri", revenue: 8400 },
    { day: "Sat", revenue: 12900 },
    { day: "Sun", revenue: 9600 },
  ],
  month: [
    { month: "Jan", revenue: 25200 },
    { month: "Feb", revenue: 28500 },
    { month: "Mar", revenue: 26100 },
    { month: "Apr", revenue: 29800 },
    { month: "May", revenue: 27400 },
    { month: "Jun", revenue: 31900 },
    { month: "Jul", revenue: 29600 },
    { month: "Aug", revenue: 32300 },
    { month: "Sep", revenue: 30800 },
    { month: "Oct", revenue: 33400 },
    { month: "Nov", revenue: 31200 },
    { month: "Dec", revenue: 35600 },
  ],
  year: [
    { year: "2019", revenue: 220000 },
    { year: "2020", revenue: 235000 },
    { year: "2021", revenue: 248000 },
    { year: "2022", revenue: 262000 },
    { year: "2023", revenue: 278000 },
    { year: "2024", revenue: 295000 },
  ],
};

export default function Dashboard() {
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");

  const [selectedPeriod, setSelectedPeriod] = useState<
    "thisDay" | "thisWeek" | "thisMonth" | "thisYear"
  >("thisMonth");

  const [selectedOwnRevenuePeriod, setSelectedOwnRevenuePeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");

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

  // Transform the own revenue data for the chart based on selected period
  const transformedOwnRevenueData = ownRevenueData[selectedOwnRevenuePeriod].map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any, index: number) => {
      let dateKey;

      switch (selectedOwnRevenuePeriod) {
        case "day":
          dateKey = item.date;
          break;
        case "week":
          dateKey = item.day;
          break;
        case "month":
          dateKey = item.month;
          break;
        case "year":
          dateKey = item.year;
          break;
        default:
          dateKey = item.month;
      }

      return {
        date: dateKey,
        revenue: item.revenue,
        previousRevenue: index > 0 ? ownRevenueData[selectedOwnRevenuePeriod][index - 1].revenue : 0,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Over View</h1>
          <p className="text-gray-500">Dashboard</p>
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
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">💰</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-[20px] font-bold text-[#131313]">
                    Coaches Revenue
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                    <p className="text-base font-medium text-[#424242]">
                      ${summaryData.ownRevenue?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">📈</span>
                  </div>
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
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">📦</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="h-[120px] shadow-[0px_2px_6px_0px_#00000014]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-[20px] font-bold text-[#131313]">
                    Total Seller
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                    <p className="text-base font-medium text-[#424242]">
                      {summaryData.totalSellers?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-xl">🏪</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

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
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <span className="text-cyan-600 text-xl">👥</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Own Revenue Ratio - Now using dummy data with working buttons */}
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
                <Button className="text-[#3B82F6]" variant="link" size="sm">
                  View Details
                  <span>
                    <SquareArrowOutUpRight />
                  </span>
                </Button>
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

        {/* Revenue Report - Updated to use dummy data */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Revenue report</CardTitle>
              <div className="flex gap-6">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>Current Period</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={
                    selectedRevenuePeriod === "day" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedRevenuePeriod("day")}
                >
                  Day
                </Button>
                <Button
                  variant={
                    selectedRevenuePeriod === "week" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedRevenuePeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant={
                    selectedRevenuePeriod === "month" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedRevenuePeriod("month")}
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={totalRevenueData[selectedRevenuePeriod]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={
                    selectedRevenuePeriod === "day"
                      ? "date"
                      : selectedRevenuePeriod === "week"
                      ? "day"
                      : selectedRevenuePeriod === "month"
                      ? "month"
                      : "year"
                  }
                />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
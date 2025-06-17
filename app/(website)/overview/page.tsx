"use client";

// import { Breadcrumb } from "@/components/breadcrumb";
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
import { SquareArrowOutUpRight } from "lucide-react";

const revenueData = [
  { date: "5 Oct", thisMonth: 1000, lastMonth: 800 },
  { date: "10 Oct", thisMonth: 1500, lastMonth: 1200 },
  { date: "14 Oct", thisMonth: 1200, lastMonth: 1400 },
  { date: "20 Oct", thisMonth: 1800, lastMonth: 1600 },
  { date: "25 Oct", thisMonth: 1400, lastMonth: 1800 },
  { date: "27 Oct", thisMonth: 1600, lastMonth: 1500 },
  { date: "30 Oct", thisMonth: 2000, lastMonth: 1700 },
];

const yearlyRevenueData = [
  { month: "JAN", thisYear: 0, lastYear: 0 },
  { month: "FEB", thisYear: 500000, lastYear: 300000 },
  { month: "MAR", thisYear: 1000000, lastYear: 800000 },
  { month: "APR", thisYear: 800000, lastYear: 1200000 },
  { month: "MAY", thisYear: 600000, lastYear: 1500000 },
  { month: "JUN", thisYear: 400000, lastYear: 800000 },
  { month: "JUL", thisYear: 200000, lastYear: 600000 },
  { month: "AUG", thisYear: 100000, lastYear: 400000 },
  { month: "SEP", thisYear: 800000, lastYear: 200000 },
  { month: "OCT", thisYear: 1200000, lastYear: 1000000 },
  { month: "NOV", thisYear: 600000, lastYear: 1200000 },
  { month: "DEC", thisYear: 400000, lastYear: 800000 },
];

const productSellData = [
  { name: "Category 1", value: 35, color: "#8b5cf6" },
  { name: "Category 2", value: 30, color: "#06b6d4" },
  { name: "Category 3", value: 27, color: "#f59e0b" },
  { name: "Category 4", value: 22, color: "#10b981" },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* <Breadcrumb items={[{ label: "Dashboard" }]} /> */}

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
                        132,570
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center">
                    {/* <TrendingUp className="h-6 w-6 text-blue-600" /> */}
                    <Image
                      src="/images/dassbardHeaderIcon-5.png"
                      alt="Logo"
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
                        132,570
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center">
                    {/* <DollarSign className="h-6 w-6 text-green-600" /> */}
                    <Image
                      src="/images/dassbardHeaderIcon-4.png"
                      alt="Logo"
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
                        132,570
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center">
                    {/* <Package className="h-6 w-6 text-orange-600" /> */}
                    <Image
                      src="/images/dassbardHeaderIcon-3.png"
                      alt="Logo"
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
                      Total Seller
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-[10px] h-[10px] bg-[#525773] rounded-full"></div>
                      <p className="text-base font-medium text-[#424242]">
                        132,570
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center">
                    {/* <Users className="h-6 w-6 text-yellow-600" /> */}
                    <Image
                      src="/images/dassbardHeaderIcon-2.png"
                      alt="Logo"
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
                        132,570
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center">
                    {/* <Users className="h-6 w-6 text-purple-600" /> */}
                    <Image
                      src="/images/dassbardHeaderIcon-1.png"
                      alt="Logo"
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
            {/* Own Revenue Ratio */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Own Revenue Ratio</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Day
                    </Button>
                    <Button variant="outline" size="sm">
                      Week
                    </Button>
                    <Button variant="default" size="sm">
                      Month
                    </Button>
                    <Button variant="outline" size="sm">
                      Year
                    </Button>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span>This Month</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-300 rounded-full mr-2"></div>
                    <span>Last Month</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Line
                      type="monotone"
                      dataKey="thisMonth"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="lastMonth"
                      stroke="#c4b5fd"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Total New Products Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between flex-wrap gap-2">
                  <div className="font-semibold">Total New Products Report</div>
                  <div className="text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span>This Day</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-300 rounded-full mr-2"></div>
                      <span>This Week</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                      <span>This Month</span>
                    </div>
                  </div>
                </CardTitle>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Day
                  </Button>
                  <Button variant="outline" size="sm">
                    Week
                  </Button>
                  <Button variant="default" size="sm">
                    Month
                  </Button>
                  <Button variant="outline" size="sm">
                    Year
                  </Button>
                </div>
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
                        strokeDashoffset="125"
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
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
                        <span>Categories name</span>
                      </div>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Report */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Revenue report</CardTitle>
                <div className="flex gap-6">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span>This Year</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span>Last Year</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Day
                  </Button>
                  <Button variant="outline" size="sm">
                    Week
                  </Button>
                  <Button variant="outline" size="sm">
                    Month
                  </Button>
                  <Button variant="default" size="sm">
                    Year
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line
                    type="monotone"
                    dataKey="thisYear"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="lastYear"
                    stroke="#f87171"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

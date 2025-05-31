"use client"

import { Card, CardContent } from "@/components/ui/card"

interface CategoryStatsProps {
  totalCategories: number
  totalSubcategories: number
  activeCategories: number
}

export function CategoryStats({ totalCategories, totalSubcategories, activeCategories }: CategoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">{totalCategories}</p>
            <p className="text-sm text-gray-600">Total Categories</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalSubcategories}</p>
            <p className="text-sm text-gray-600">Total Subcategories</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
            <p className="text-sm text-gray-600">Active Categories</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

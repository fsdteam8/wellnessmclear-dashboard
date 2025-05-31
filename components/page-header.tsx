"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PageHeaderProps {
  title: string
  buttonText?: string
  onButtonClick?: () => void
}

export function PageHeader({ title, buttonText, onButtonClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {buttonText && (
        <Button onClick={onButtonClick} className="bg-slate-600 hover:bg-slate-700">
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      )}
    </div>
  )
}

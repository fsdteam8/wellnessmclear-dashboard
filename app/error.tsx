"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">An error occurred while loading the page.</p>
        <Button onClick={reset} className="bg-slate-600 hover:bg-slate-700">
          Try again
        </Button>
      </div>
    </div>
  )
}

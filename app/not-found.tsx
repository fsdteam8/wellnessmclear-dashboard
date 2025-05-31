import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">Could not find the requested page.</p>
        <Link href="/">
          <Button className="bg-slate-600 hover:bg-slate-700">Return Home</Button>
        </Link>
      </div>
    </div>
  )
}

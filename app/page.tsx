"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard') // replace avoids keeping history
  }, [router])

  return null // You don't need to render anything
}
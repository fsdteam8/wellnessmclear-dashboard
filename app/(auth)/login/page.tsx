"use client"
import SignInForm from '@/components/auth/signin-form'
// import React, { useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'

export default function Page() {
  // const { status } = useSession()
  // const router = useRouter()

  // useEffect(() => {
  //   if (status === 'authenticated') {
  //     router.push('/')
  //   }
  // },[])
  return (
    <div>
      <SignInForm />
    </div>
  )
}

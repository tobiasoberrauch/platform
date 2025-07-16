'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      // Use window.location instead of next/router to avoid dynamic require issues
      window.location.href = '/api/auth/signin'
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
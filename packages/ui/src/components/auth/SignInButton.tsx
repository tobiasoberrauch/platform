'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export function SignInButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed">Loading...</button>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Signed in as {session.user?.email}
        </span>
        <button 
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={() => signIn('cidaas')}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Sign in with Cidaas
    </button>
  )
}
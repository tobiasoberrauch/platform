import { SessionProvider } from 'next-auth/react'
import { SignInButton } from '@digital-platform/ui'

export default function SimpleAuthTest() {
  return (
    <SessionProvider>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Authentication Test</h1>
        <SignInButton />
      </div>
    </SessionProvider>
  )
}
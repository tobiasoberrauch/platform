import { useSession, signIn, signOut } from 'next-auth/react'

export default function DebugAuth() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Authentication</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Session:</strong> {session ? 'Authenticated' : 'Not authenticated'}
        </div>
        {session && (
          <div>
            <strong>User:</strong> {session.user?.email || 'No email'}
          </div>
        )}
        <div>
          {session ? (
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => signIn('cidaas')}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Sign In with Cidaas
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function TestCidaasPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog(`Session status: ${status}`)
    if (session) {
      addLog(`User authenticated: ${session.user?.email}`)
    }
  }, [status, session])

  const handleSignIn = async () => {
    addLog('Starting cidaas authentication...')
    try {
      const result = await signIn('cidaas', { 
        redirect: false,
        callbackUrl: '/test-cidaas' 
      })
      
      if (result?.error) {
        addLog(`Sign in error: ${result.error}`)
      } else if (result?.ok) {
        addLog('Sign in initiated successfully')
      }
    } catch (error) {
      addLog(`Exception: ${error}`)
    }
  }

  const handleDirectAuth = () => {
    addLog('Redirecting to cidaas directly...')
    // Direct OAuth URL for testing
    const params = new URLSearchParams({
      client_id: '447ee923-8191-4a61-b763-3f547aac3bff',
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: 'http://localhost:3000/api/auth/callback/cidaas',
      state: 'test-state'
    })
    
    const authUrl = `https://audius-prod.cidaas.eu/authz-srv/authz?${params.toString()}`
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cidaas Authentication Test</h1>
        
        {/* Status Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Session Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                status === 'authenticated' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </div>
            
            {session && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">User:</span>
                  <span>{session.user?.name || 'No name'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{session.user?.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">ID:</span>
                  <span className="font-mono text-sm">{(session.user as any)?.id || 'No ID'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            {status === 'unauthenticated' && (
              <>
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sign In with Cidaas (NextAuth)
                </button>
                
                <button
                  onClick={handleDirectAuth}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Direct OAuth Test (Bypass NextAuth)
                </button>
              </>
            )}
            
            {status === 'authenticated' && (
              <button
                onClick={() => {
                  addLog('Signing out...')
                  signOut({ redirect: false })
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Client ID:</span> 1401d46e-ad31-4b36-98e3-9a740a14a64b</div>
            <div><span className="font-medium">Auth URL:</span> https://audius-prod.cidaas.eu/authz-srv/authz</div>
            <div><span className="font-medium">Callback:</span> http://localhost:3000/api/auth/callback/cidaas</div>
            <div><span className="font-medium">Scopes:</span> openid email profile</div>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>

        {/* Test API Endpoints */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
          <div className="space-y-2">
            <button
              onClick={async () => {
                addLog('Testing /api/auth/session...')
                const res = await fetch('/api/auth/session')
                const data = await res.json()
                addLog(`Session response: ${JSON.stringify(data)}`)
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Test Session Endpoint
            </button>
            
            <button
              onClick={async () => {
                addLog('Testing /api/auth/providers...')
                const res = await fetch('/api/auth/providers')
                const data = await res.json()
                addLog(`Providers: ${JSON.stringify(data)}`)
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Test Providers Endpoint
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
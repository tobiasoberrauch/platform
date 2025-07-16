import { useSession, signOut, signIn, getSession } from 'next-auth/react'
import { AuthProvider } from '../components/auth/AuthProvider'
import { useState } from 'react'

function DebugSessionContent() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  const testCidaasAPI = async () => {
    setTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/admin/cidaas-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setTestResult(`Original API Response: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestLoading(false)
    }
  }

  const testGraphAPI = async () => {
    setTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/admin/cidaas-users-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 0,
          size: 10,
          sortfield: 'created_time',
          descending: true,
          fieldsFilter: [],
          groupsFilter: [],
          terms: [],
          excludeUserCount: false,
          groupsCondition: 'and'
        })
      })
      
      const data = await response.json()
      setTestResult(`Graph API Response: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestLoading(false)
    }
  }

  const testAuth = async () => {
    setTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/test-auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setTestResult(`Auth Test Response: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestLoading(false)
    }
  }

  const handleSignOut = async () => {
    setTestResult('Signing out...')
    try {
      await signOut({ redirect: false })
      setTestResult('Successfully signed out. Please refresh the page.')
    } catch (error) {
      setTestResult(`Sign out error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSignIn = async () => {
    setTestResult('Redirecting to sign in...')
    try {
      // Use callbackUrl to redirect back to this debug page after authentication
      const result = await signIn('cidaas', { 
        callbackUrl: window.location.href,
        redirect: true // Allow redirect to cidaas
      })
      
      if (result?.error) {
        setTestResult(`Sign in error: ${result.error}`)
      } else {
        setTestResult('Sign in initiated. You should be redirected to cidaas.')
      }
    } catch (error) {
      setTestResult(`Sign in error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const refreshSession = async () => {
    setTestResult('Refreshing session...')
    try {
      // Get a fresh session from NextAuth
      const updatedSession = await getSession()
      
      if (updatedSession) {
        setTestResult(`Session refreshed successfully: ${JSON.stringify(updatedSession, null, 2)}`)
        // Force a page refresh to update the useSession hook
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setTestResult('Session refresh failed: No session returned')
      }
    } catch (error) {
      setTestResult(`Session refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testCidaasDirect = async () => {
    setTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/test-cidaas-direct', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setTestResult(`Cidaas Direct Test: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestLoading(false)
    }
  }

  const testAccessControl = async () => {
    setTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/test-access-control', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setTestResult(`Access Control Test: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug Info</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h2 className="font-bold mb-2 text-blue-800">🔍 Debug Instructions</h2>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Step 1:</strong> Check if you have a valid session and access token below</p>
          <p><strong>Step 2:</strong> If missing access token, click "Sign Out" then "Sign In with Cidaas"</p>
          <p><strong>Step 3:</strong> Test authentication with the "Test Auth" button</p>
          <p><strong>Step 4:</strong> Try the API endpoints to see if they work</p>
          <p><strong>Step 5:</strong> Use "Refresh Session" if you need to update the session</p>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Session Status</h2>
        <p>Status: <span className="font-mono">{status}</span></p>
        <p>Authenticated: <span className="font-mono">{session ? 'Yes' : 'No'}</span></p>
        
        <div className="mt-4 flex gap-2 flex-wrap">
          {session ? (
            <>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                🚪 Sign Out
              </button>
              <button
                onClick={refreshSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🔄 Refresh Session
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              🔐 Sign In with Cidaas
            </button>
          )}
        </div>
      </div>

      {session && (
        <>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">User Info</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session.user, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">Session Tokens</h2>
            <p>Has Access Token: <span className="font-mono">{(session as any).accessToken ? 'Yes' : 'No'}</span></p>
            <p>Has Refresh Token: <span className="font-mono">{(session as any).refreshToken ? 'Yes' : 'No'}</span></p>
            {(session as any).accessToken && (
              <div className="mt-2">
                <p className="font-bold">Access Token Preview:</p>
                <p className="font-mono text-xs break-all">
                  {(session as any).accessToken.substring(0, 50)}...
                </p>
              </div>
            )}
            {!(session as any).accessToken && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Missing Access Token</strong><br />
                  The session doesn't contain an access token. This might happen if:
                  <br />• You need to sign out and sign back in after auth configuration changes
                  <br />• The auth provider didn't provide an access token
                  <br />• There was an issue in the JWT callback
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">API Test</h2>
            <p className="mb-3 text-sm text-gray-600">Test the API calls that the user management component makes:</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                onClick={testAuth}
                disabled={testLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? 'Testing...' : 'Test Auth'}
              </button>
              <button
                onClick={testCidaasDirect}
                disabled={testLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? 'Testing...' : 'Test Cidaas Direct'}
              </button>
              <button
                onClick={testCidaasAPI}
                disabled={testLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? 'Testing...' : 'Test Original API'}
              </button>
              <button
                onClick={testGraphAPI}
                disabled={testLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? 'Testing...' : 'Test Graph API'}
              </button>
              <button
                onClick={testAccessControl}
                disabled={testLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? 'Testing...' : 'Test Access Control'}
              </button>
            </div>
            {testResult && (
              <div className="mt-3 p-3 bg-white border rounded max-h-40 overflow-auto">
                <pre className="text-xs">{testResult}</pre>
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Full Session Object</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  )
}

export default function DebugSession() {
  return (
    <AuthProvider>
      <DebugSessionContent />
    </AuthProvider>
  )
}
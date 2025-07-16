import { GetServerSideProps } from 'next'
import { getProviders, signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface SignInPageProps {
  providers: any
  error?: string
}

export default function SignInPage({ providers, error }: SignInPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const { callbackUrl } = router.query

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true)
    try {
      await signIn(providerId, { 
        callbackUrl: callbackUrl as string || '/' 
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | undefined) => {
    switch (error) {
      case 'cidaas':
        return 'There was an issue with the Cidaas authentication provider. Please check the configuration.'
      case 'Callback':
        return 'There was an error during the authentication callback. Please try again.'
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.'
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account in the database.'
      case 'EmailCreateAccount':
        return 'Could not create email account in the database.'
      case 'Signin':
        return 'Error occurred during sign in.'
      case 'OAuthAccountNotLinked':
        return 'Email on the account is already linked, but not with this OAuth account.'
      case 'EmailSignin':
        return 'Sending the e-mail with the verification token failed.'
      case 'CredentialsSignin':
        return 'The authorize callback returned null in the Credentials provider.'
      case 'SessionRequired':
        return 'The content of this page requires you to be signed in at all times.'
      default:
        return error || 'An unknown error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">🚀</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Digital Platform</h1>
          <p className="text-gray-600 mb-6">Sign in to access your workspace</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                  <p className="text-sm text-red-700 mt-1">{getErrorMessage(error)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {providers && Object.values(providers).map((provider: any) => (
              <button
                key={provider.name}
                onClick={() => handleSignIn(provider.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                Sign in with {provider.name}
              </button>
            ))}
          </div>
          
          {error && (
            <div className="mt-6">
              <details className="text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Debug Information
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Error: {error}</p>
                  <p className="text-xs text-gray-600">Callback URL: {callbackUrl}</p>
                  <p className="text-xs text-gray-600">Available Providers: {providers ? Object.keys(providers).join(', ') : 'None'}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders()
  const session = await getSession(context)
  const { error } = context.query

  // If user is already authenticated, redirect to home
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      providers: providers ?? {},
      error: error ?? null,
    },
  }
}
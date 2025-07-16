import { type NextAuthOptions } from 'next-auth'

// Create a function that returns the auth options with runtime environment variables
export function getAuthOptions(): NextAuthOptions {
  // Validate required environment variables at runtime
  if (!process.env.CIDAAS_CLIENT_ID) {
    throw new Error('Missing CIDAAS_CLIENT_ID environment variable')
  }
  if (!process.env.CIDAAS_CLIENT_SECRET) {
    throw new Error('Missing CIDAAS_CLIENT_SECRET environment variable')
  }
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('Missing NEXTAUTH_SECRET environment variable')
  }

  return {
    providers: [
      {
        id: 'cidaas',
        name: 'Cidaas',
        type: 'oauth',
        issuer: 'https://audius-prod.cidaas.eu',
        wellKnown: 'https://audius-prod.cidaas.eu/.well-known/openid-configuration',
        clientId: process.env.CIDAAS_CLIENT_ID,
        clientSecret: process.env.CIDAAS_CLIENT_SECRET,
        authorization: {
          params: {
            scope: 'openid email profile cidaas:users_read cidaas:users_search',
          }
        },
        checks: ['state'],
        client: {
          token_endpoint_auth_method: 'client_secret_post',
        },
        profile(profile) {
          console.log('Cidaas Profile:', JSON.stringify(profile, null, 2))
          return {
            id: profile.sub,
            name: profile.name || profile.email,
            email: profile.email,
            image: profile.picture,
          }
        },
      },
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback - User:', user)
      console.log('SignIn Callback - Account:', account)
      console.log('SignIn Callback - Profile:', profile)
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.sub;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session
    },
    async jwt({ token, user, account }) {
      console.log('JWT Callback - Token:', token)
      console.log('JWT Callback - User:', user)
      console.log('JWT Callback - Account:', account?.provider)
      
      if (user) {
        token.sub = user.id
      }
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
  }
}

// Note: Use getAuthOptions() instead of this static export to ensure runtime environment variable loading


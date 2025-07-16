import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the JWT token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get access token from JWT
    const accessToken = (token as any).accessToken

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' })
    }

    // Try different cidaas endpoints
    const endpoints = [
      '/users-srv/users',
      '/users-srv/users/list',
      '/users-srv/userinfo',
      '/user-profile/users',
      '/users-srv/user/search'
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        const url = `https://audius-prod.cidaas.eu${endpoint}?limit=10`
        console.log(`[Test-Cidaas] Testing endpoint: ${url}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        const text = await response.text()
        let data
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }

        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data
        })
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Also check the token claims
    const tokenInfo = {
      email: token.email,
      sub: token.sub,
      iat: token.iat,
      exp: token.exp,
      scopes: (token as any).scopes || 'not available',
      hasAccessToken: !!accessToken,
      tokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : 'no token'
    }

    res.status(200).json({
      tokenInfo,
      endpoints: results
    })
  } catch (error) {
    console.error('Error in test-cidaas:', error)
    res.status(500).json({ 
      error: 'Failed to test cidaas',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
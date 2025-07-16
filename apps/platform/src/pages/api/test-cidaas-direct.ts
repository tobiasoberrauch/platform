import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const accessToken = (token as any).accessToken

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' })
    }

    console.log('[test-cidaas-direct] Testing different cidaas endpoints...')
    console.log('[test-cidaas-direct] Access token length:', accessToken.length)

    const endpoints: Array<{
      name: string
      url: string
      method: string
      body?: any
      headers?: Record<string, string>
    }> = [
      {
        name: 'User Info',
        url: 'https://audius-prod.cidaas.eu/userinfo',
        method: 'GET'
      },
      {
        name: 'Users Management',
        url: 'https://audius-prod.cidaas.eu/users-mgmt-srv/users?limit=1',
        method: 'GET'
      },
      {
        name: 'Users Service',
        url: 'https://audius-prod.cidaas.eu/users-srv/users?limit=1',
        method: 'GET'
      },
      {
        name: 'Graph Users (Simple)',
        url: 'https://audius-prod.cidaas.eu/user-srv/graph/users',
        method: 'POST',
        body: {
          from: 0,
          size: 1,
          sortfield: 'created_time',
          descending: true,
          fieldsFilter: [],
          groupsFilter: [],
          terms: [],
          excludeUserCount: false,
          groupsCondition: 'and'
        }
      },
      {
        name: 'Graph Users (Minimal)',
        url: 'https://audius-prod.cidaas.eu/user-srv/graph/users',
        method: 'POST',
        body: {
          from: 0,
          size: 1
        }
      },
      {
        name: 'Token Info',
        url: 'https://audius-prod.cidaas.eu/token/introspect',
        method: 'POST',
        body: {
          token: accessToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`[test-cidaas-direct] Testing ${endpoint.name}: ${endpoint.url}`)
        
        const isTokenIntrospect = endpoint.name === 'Token Info'
        
        const fetchOptions: RequestInit = {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            ...(endpoint.headers || {}),
            ...(endpoint.method === 'POST' && !isTokenIntrospect && { 'Content-Type': 'application/json' })
          },
          ...(endpoint.body && { 
            body: isTokenIntrospect 
              ? new URLSearchParams({ token: accessToken }).toString()
              : JSON.stringify(endpoint.body) 
          })
        }

        const response = await fetch(endpoint.url, fetchOptions)
        
        const isJson = response.headers.get('content-type')?.includes('application/json')
        const data = isJson ? await response.json() : await response.text()

        results.push({
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: response.status,
          success: response.ok,
          data: response.ok ? data : undefined,
          error: !response.ok ? data : undefined,
          headers: Object.fromEntries(response.headers.entries())
        })

        console.log(`[test-cidaas-direct] ${endpoint.name}: ${response.status}`)
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.error(`[test-cidaas-direct] ${endpoint.name} error:`, error)
      }
    }

    res.status(200).json({
      success: true,
      tokenInfo: {
        hasAccessToken: !!accessToken,
        tokenLength: accessToken.length,
        tokenPreview: accessToken.substring(0, 20) + '...',
        email: token.email,
        sub: token.sub
      },
      endpointTests: results
    })
  } catch (error) {
    console.error('[test-cidaas-direct] General error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
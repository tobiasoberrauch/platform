import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[cidaas-users] Request headers:', req.headers.cookie ? 'Has cookies' : 'No cookies')
    console.log('[cidaas-users] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
    
    // Get the JWT token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    console.log('[cidaas-users] Token retrieved:', !!token)
    if (token) {
      console.log('[cidaas-users] Token email:', token.email)
      console.log('[cidaas-users] Token has accessToken:', !!(token as any).accessToken)
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Check if user has admin access
    const isAdmin = token.email?.includes('admin') || 
                   token.email?.includes('tobias.oberrauch@audius.de')

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Get access token from JWT
    const accessToken = (token as any).accessToken

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' })
    }

    // Try the new graph API endpoint first (most comprehensive)
    try {
      console.log('[cidaas-users API] Trying graph API endpoint...')
      
      const graphResponse = await fetch('https://audius-prod.cidaas.eu/user-srv/graph/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          from: 0,
          size: 100,
          sortfield: 'created_time',
          descending: true,
          fieldsFilter: [],
          groupsFilter: [],
          terms: [],
          excludeUserCount: false,
          groupsCondition: 'and'
        })
      })

      if (graphResponse.ok) {
        const graphData = await graphResponse.json()
        console.log('[cidaas-users API] Success with graph API endpoint')
        
        // Normalize the response structure for graph API
        if (graphData.users && Array.isArray(graphData.users)) {
          return res.status(200).json({
            success: true,
            data: graphData.users,
            total: graphData.total_count || graphData.users.length,
            endpoint: '/user-srv/graph/users'
          })
        } else if (Array.isArray(graphData)) {
          return res.status(200).json({
            success: true,
            data: graphData,
            total: graphData.length,
            endpoint: '/user-srv/graph/users'
          })
        } else {
          console.log('[cidaas-users API] Unexpected graph API response structure:', graphData)
        }
      } else {
        console.log(`[cidaas-users API] Graph API failed: ${graphResponse.status}`)
      }
    } catch (error) {
      console.error('[cidaas-users API] Graph API error:', error)
    }

    // Fallback to original endpoints
    const endpoints = [
      '/users-mgmt-srv/users',
      '/users-srv/users',
      '/users-srv/users/list',
      '/user-profile/users'
    ]

    let successResponse = null
    let lastError = null

    for (const endpoint of endpoints) {
      try {
        const url = `https://audius-prod.cidaas.eu${endpoint}?limit=100&offset=0`
        console.log(`[cidaas-users API] Trying fallback endpoint: ${url}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`[cidaas-users API] Success with fallback endpoint: ${endpoint}`)
          
          // Normalize the response structure
          if (Array.isArray(data)) {
            successResponse = {
              success: true,
              data: data,
              endpoint: endpoint
            }
          } else if (data.data && Array.isArray(data.data)) {
            successResponse = {
              success: true,
              data: data.data,
              total: data.total_count || data.data.length,
              endpoint: endpoint
            }
          } else if (data.users && Array.isArray(data.users)) {
            successResponse = {
              success: true,
              data: data.users,
              total: data.total || data.users.length,
              endpoint: endpoint
            }
          } else {
            console.log(`[cidaas-users API] Unexpected data structure from ${endpoint}:`, data)
            continue
          }
          break
        } else {
          console.log(`[cidaas-users API] Failed with fallback endpoint ${endpoint}: ${response.status}`)
          lastError = `${endpoint}: ${response.status} ${response.statusText}`
        }
      } catch (error) {
        console.error(`[cidaas-users API] Error with fallback endpoint ${endpoint}:`, error)
        lastError = `${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    if (successResponse) {
      res.status(200).json(successResponse)
    } else {
      // Return mock data if no endpoint works
      console.log('[cidaas-users API] All endpoints failed, returning mock data')
      res.status(200).json({
        success: true,
        data: [
          {
            sub: 'd38ca6fe-7301-45bd-a9ca-492503bd6171',
            email: token.email || 'tobias.oberrauch@audius.de',
            given_name: 'Tobias',
            family_name: 'Oberrauch',
            name: 'Tobias Oberrauch',
            user_status: 'VERIFIED',
            subscription: 'clevercsrd-professional-b1',
            subscription_valid: true,
            account_id: 'cust-0015'
          },
          {
            sub: 'demo-user-1',
            email: 'max.mustermann@example.com',
            given_name: 'Max',
            family_name: 'Mustermann',
            name: 'Max Mustermann',
            user_status: 'VERIFIED',
            subscription: 'basic',
            subscription_valid: true,
            account_id: 'cust-0016'
          },
          {
            sub: 'demo-user-2',
            email: 'anna.schmidt@example.com',
            given_name: 'Anna',
            family_name: 'Schmidt',
            name: 'Anna Schmidt',
            user_status: 'VERIFIED',
            subscription: 'professional',
            subscription_valid: true,
            account_id: 'cust-0017'
          }
        ],
        total: 3,
        note: 'Mock data - cidaas endpoints not accessible',
        lastError: lastError
      })
    }
  } catch (error) {
    console.error('[cidaas-users API] General error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
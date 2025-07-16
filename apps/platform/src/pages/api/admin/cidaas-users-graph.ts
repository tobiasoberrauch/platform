import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

interface GraphSearchRequest {
  from?: number
  size?: number
  sortfield?: string
  descending?: boolean
  fieldsFilter?: Array<{
    field: string
    value: any
    exactMatch?: boolean
  }>
  groupsFilter?: Array<{
    groupId: string
    roles: string[]
    rolesCondition?: 'and' | 'or'
  }>
  terms?: string[]
  excludeUserCount?: boolean
  fields?: string
  groupsCondition?: 'and' | 'or'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[cidaas-users-graph] Request headers:', req.headers.cookie ? 'Has cookies' : 'No cookies')
    console.log('[cidaas-users-graph] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
    
    // Get the JWT token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    console.log('[cidaas-users-graph] Token retrieved:', !!token)
    if (token) {
      console.log('[cidaas-users-graph] Token email:', token.email)
      console.log('[cidaas-users-graph] Token has accessToken:', !!(token as any).accessToken)
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

    // Parse request body for search parameters
    const searchParams: GraphSearchRequest = req.body || {}
    const {
      from = 0,
      size = 100,
      sortfield = 'created_time',
      descending = true,
      fieldsFilter = [],
      groupsFilter = [],
      terms = [],
      excludeUserCount = false,
      fields,
      groupsCondition = 'and'
    } = searchParams

    console.log('[cidaas-users-graph API] Making graph API request with params:', {
      from,
      size,
      sortfield,
      descending,
      fieldsFilter,
      groupsFilter,
      terms,
      excludeUserCount,
      fields,
      groupsCondition
    })

    const requestBody = {
      from,
      size,
      sortfield,
      descending,
      fieldsFilter,
      groupsFilter,
      terms,
      excludeUserCount,
      ...(fields && { fields }),
      groupsCondition
    }

    console.log('[cidaas-users-graph API] Request body:', JSON.stringify(requestBody, null, 2))
    console.log('[cidaas-users-graph API] Access token length:', accessToken.length)
    console.log('[cidaas-users-graph API] Access token preview:', accessToken.substring(0, 20) + '...')

    const response = await fetch('https://audius-prod.cidaas.eu/user-srv/graph/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('[cidaas-users-graph API] Response status:', response.status)
    console.log('[cidaas-users-graph API] Response headers:', Object.fromEntries((response.headers as any).entries()))

    if (response.ok) {
      const data = await response.json()
      console.log('[cidaas-users-graph API] Success - found users:', data.users?.length || 0)
      
      // Normalize response structure
      if (data.users && Array.isArray(data.users)) {
        res.status(200).json({
          success: true,
          data: data.users,
          total: data.total_count || data.users.length,
          endpoint: '/user-srv/graph/users',
          searchParams
        })
      } else if (Array.isArray(data)) {
        res.status(200).json({
          success: true,
          data: data,
          total: data.length,
          endpoint: '/user-srv/graph/users',
          searchParams
        })
      } else {
        console.log('[cidaas-users-graph API] Unexpected response structure:', data)
        res.status(200).json({
          success: false,
          error: 'Unexpected response structure',
          rawResponse: data
        })
      }
    } else {
      const errorText = await response.text()
      console.error('[cidaas-users-graph API] Error:', response.status, errorText)
      console.error('[cidaas-users-graph API] Request URL:', 'https://audius-prod.cidaas.eu/user-srv/graph/users')
      console.error('[cidaas-users-graph API] Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`
      })
      
      res.status(response.status).json({
        success: false,
        error: `Graph API error: ${response.status} ${response.statusText}`,
        details: errorText,
        requestBody: requestBody,
        url: 'https://audius-prod.cidaas.eu/user-srv/graph/users'
      })
    }
  } catch (error) {
    console.error('[cidaas-users-graph API] Exception:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
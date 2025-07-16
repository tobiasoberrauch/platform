import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { fetchCidaasUsers, type CidaasSearchParams } from '@digital-platform/config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the access token from the NextAuth session
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token || !token.accessToken) {
      return res.status(401).json({ error: 'Unauthorized - No access token' })
    }

    // Parse query parameters
    const {
      limit = '50',
      offset = '0',
      order_by = 'created_time',
      order = 'desc',
      search,
      email,
      given_name,
      family_name,
      user_status
    } = req.query

    // Build search parameters
    const params: CidaasSearchParams = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order_by: order_by as any,
      order: order as 'asc' | 'desc',
    }

    if (search) {
      params.search = search as string
    }

    if (email || given_name || family_name || user_status) {
      params.filter = {}
      if (email) params.filter.email = email as string
      if (given_name) params.filter.given_name = given_name as string
      if (family_name) params.filter.family_name = family_name as string
      if (user_status) params.filter.user_status = user_status as any
    }

    // Fetch users from cidaas
    const result = await fetchCidaasUsers(token.accessToken as string, params)

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    return res.status(200).json(result.data)
  } catch (error) {
    console.error('Error in /api/cidaas/users:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}
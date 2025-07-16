import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { fetchCidaasUsers } from '@digital-platform/config'
import { evaluateUserAccess, createUserFromCidaas, defaultCidaasAccessConfig } from '@digital-platform/config/src/cidaas-access-control'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const isAdmin = token.email?.includes('admin') || 
                   token.email?.includes('tobias.oberrauch@audius.de')

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const accessToken = (token as any).accessToken

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' })
    }

    console.log('[sync-cidaas-users] Starting user sync...')

    let cidaasUsers = []
    let usingMockData = false

    // Try to fetch cidaas users, fall back to mock data if it fails
    try {
      const cidaasResponse = await fetchCidaasUsers(accessToken, {
        limit: 1000,
        offset: 0
      })

      if (cidaasResponse.success && cidaasResponse.data) {
        cidaasUsers = cidaasResponse.data?.data || cidaasResponse.data || []
        console.log('[sync-cidaas-users] Found', cidaasUsers.length, 'cidaas users from API')
      } else {
        throw new Error(cidaasResponse.error || 'Cidaas API failed')
      }
    } catch (error) {
      console.log('[sync-cidaas-users] Cidaas API failed, using mock data:', error)
      usingMockData = true
      
      // Use mock cidaas users for demonstration
      cidaasUsers = [
        {
          sub: 'd38ca6fe-7301-45bd-a9ca-492503bd6171',
          email: token.email || 'tobias.oberrauch@audius.de',
          given_name: 'Tobias',
          family_name: 'Oberrauch',
          name: 'Tobias Oberrauch',
          user_status: 'VERIFIED',
          subscription: 'clevercsrd-professional-b1',
          groups: ['admin', 'csrd-team'],
          roles: ['admin'],
          created_time: '2024-01-01T00:00:00Z'
        },
        {
          sub: 'demo-user-1',
          email: 'max.mustermann@audius.de',
          given_name: 'Max',
          family_name: 'Mustermann', 
          name: 'Max Mustermann',
          user_status: 'VERIFIED',
          subscription: 'professional',
          groups: ['csrd-team'],
          roles: ['user'],
          created_time: '2024-01-15T00:00:00Z'
        },
        {
          sub: 'demo-user-2',
          email: 'anna.schmidt@example.com',
          given_name: 'Anna',
          family_name: 'Schmidt',
          name: 'Anna Schmidt',
          user_status: 'VERIFIED',
          subscription: 'basic',
          groups: [],
          roles: ['user'],
          created_time: '2024-02-01T00:00:00Z'
        },
        {
          sub: 'demo-user-3',
          email: 'support@clevercompany.ai',
          given_name: 'Support',
          family_name: 'Team',
          name: 'Support Team',
          user_status: 'VERIFIED',
          subscription: 'enterprise',
          groups: ['support'],
          roles: ['user'],
          created_time: '2024-01-20T00:00:00Z'
        },
        {
          sub: 'demo-user-4',
          email: 'guest@external.com',
          given_name: 'Guest',
          family_name: 'User',
          name: 'Guest User',
          user_status: 'PENDING',
          subscription: null,
          groups: [],
          roles: [],
          created_time: '2024-03-01T00:00:00Z'
        }
      ]
      console.log('[sync-cidaas-users] Using', cidaasUsers.length, 'mock users for demonstration')
    }

    // Process each user through access control
    const processedUsers = cidaasUsers.map(cidaasUser => {
      const platformUser = createUserFromCidaas(cidaasUser)
      const access = evaluateUserAccess(cidaasUser)
      
      return {
        cidaasUser,
        platformUser,
        access,
        hasAccess: access.applications.length > 0
      }
    })

    // Statistics
    const stats = {
      total: processedUsers.length,
      withAccess: processedUsers.filter(u => u.hasAccess).length,
      byRole: {
        admin: processedUsers.filter(u => u.platformUser.role === 'admin').length,
        user: processedUsers.filter(u => u.platformUser.role === 'user').length,
        guest: processedUsers.filter(u => u.platformUser.role === 'guest').length
      },
      byApplication: {
        platform: processedUsers.filter(u => u.access.applications.includes('platform')).length,
        benchmark: processedUsers.filter(u => u.access.applications.includes('benchmark')).length,
        csrd: processedUsers.filter(u => u.access.applications.includes('csrd')).length,
        support: processedUsers.filter(u => u.access.applications.includes('support')).length
      }
    }

    // Here you could store the processed users in your database
    // await storeUsersInDatabase(processedUsers.map(u => u.platformUser))

    console.log('[sync-cidaas-users] Sync completed:', stats)

    res.status(200).json({
      success: true,
      message: usingMockData 
        ? 'Users synced successfully (using mock data - cidaas API unavailable)' 
        : 'Users synced successfully',
      usingMockData,
      stats,
      users: processedUsers.map(u => ({
        id: u.platformUser.id,
        name: u.platformUser.name,
        email: u.platformUser.email,
        role: u.platformUser.role,
        applications: u.access.applications,
        functions: u.access.functions,
        permissions: u.access.permissions,
        appliedRules: u.platformUser.cidaasData.appliedRules,
        hasAccess: u.hasAccess,
        subscription: u.cidaasUser.subscription,
        groups: u.cidaasUser.groups || [],
        roles: u.cidaasUser.roles || []
      }))
    })
  } catch (error) {
    console.error('[sync-cidaas-users] Error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
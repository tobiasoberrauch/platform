import { NextApiRequest, NextApiResponse } from 'next'
import { evaluateUserAccess, createUserFromCidaas } from '@digital-platform/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mock cidaas user data for testing
    const testUsers = [
      {
        sub: 'admin-test',
        email: 'tobias.oberrauch@audius.de',
        given_name: 'Tobias',
        family_name: 'Oberrauch',
        name: 'Tobias Oberrauch',
        user_status: 'VERIFIED',
        subscription: 'clevercsrd-professional-b1',
        groups: ['admin', 'csrd-team'],
        roles: ['admin']
      },
      {
        sub: 'professional-user',
        email: 'user@audius.de',
        given_name: 'Professional',
        family_name: 'User',
        name: 'Professional User',
        user_status: 'VERIFIED',
        subscription: 'professional',
        groups: ['csrd-team'],
        roles: ['user']
      },
      {
        sub: 'basic-user',
        email: 'basic@example.com',
        given_name: 'Basic',
        family_name: 'User', 
        name: 'Basic User',
        user_status: 'VERIFIED',
        subscription: 'basic',
        groups: [],
        roles: ['user']
      },
      {
        sub: 'external-user',
        email: 'external@external.com',
        given_name: 'External',
        family_name: 'User',
        name: 'External User',
        user_status: 'PENDING',
        subscription: null,
        groups: [],
        roles: []
      }
    ]

    // Process each test user through access control
    const results = testUsers.map(cidaasUser => {
      const access = evaluateUserAccess(cidaasUser)
      const platformUser = createUserFromCidaas(cidaasUser)
      
      return {
        input: {
          email: cidaasUser.email,
          subscription: cidaasUser.subscription,
          groups: cidaasUser.groups,
          roles: cidaasUser.roles
        },
        output: {
          role: access.role,
          applications: access.applications,
          functions: access.functions,
          permissions: access.permissions,
          appliedRules: access.appliedRules,
          hasAccess: access.applications.length > 0
        },
        platformUser: {
          id: platformUser.id,
          name: platformUser.name,
          role: platformUser.role,
          isActive: platformUser.isActive
        }
      }
    })

    res.status(200).json({
      success: true,
      message: 'Access control test completed',
      testResults: results,
      summary: {
        totalUsers: results.length,
        withAccess: results.filter(r => r.output.hasAccess).length,
        admins: results.filter(r => r.output.role === 'admin').length,
        users: results.filter(r => r.output.role === 'user').length,
        guests: results.filter(r => r.output.role === 'guest').length
      }
    })
  } catch (error) {
    console.error('[test-access-control] Error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
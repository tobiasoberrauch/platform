import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { defaultCidaasAccessConfig } from '@digital-platform/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'GET') {
      // Return current access rules configuration
      res.status(200).json({
        success: true,
        accessConfig: defaultCidaasAccessConfig,
        documentation: {
          description: 'Cidaas Access Control System',
          ruleTypes: {
            email: 'Specific email addresses',
            emailDomain: 'Email domain restrictions (e.g., @audius.de)',
            groups: 'Cidaas user groups',
            roles: 'Cidaas user roles',
            subscription: 'Subscription types from custom fields',
            customFields: 'Custom cidaas user attributes'
          },
          prioritySystem: 'Higher priority rules override lower ones',
          accessGrants: {
            applications: 'Array of accessible application IDs',
            functions: 'Array of accessible function IDs',
            permissions: 'Array of granted permissions',
            role: 'Assigned platform role (admin, user, guest)'
          }
        }
      })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('[access-rules] Error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[test-auth] Request method:', req.method)
    console.log('[test-auth] Has cookies:', !!req.headers.cookie)
    console.log('[test-auth] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
    console.log('[test-auth] NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0)
    
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    console.log('[test-auth] Token retrieved:', !!token)
    
    if (token) {
      console.log('[test-auth] Token keys:', Object.keys(token))
      console.log('[test-auth] Token email:', token.email)
      console.log('[test-auth] Token sub:', token.sub)
      console.log('[test-auth] Token has accessToken:', !!(token as any).accessToken)
      console.log('[test-auth] Token has refreshToken:', !!(token as any).refreshToken)
    }
    
    return res.status(200).json({
      authenticated: !!token,
      token: token ? {
        email: token.email,
        sub: token.sub,
        name: token.name,
        hasAccessToken: !!(token as any).accessToken,
        hasRefreshToken: !!(token as any).refreshToken,
        tokenKeys: Object.keys(token)
      } : null
    })
  } catch (error) {
    console.error('[test-auth] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
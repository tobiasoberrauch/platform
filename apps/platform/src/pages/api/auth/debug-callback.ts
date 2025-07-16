import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthOptions } from '@digital-platform/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state, error, error_description } = req.query
  
  const debugInfo = {
    query: req.query,
    method: req.method,
    headers: {
      host: req.headers.host,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent'],
    },
    authOptions: {
      providers: getAuthOptions().providers.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        hasClientId: !!p.clientId,
        hasClientSecret: !!p.clientSecret,
      })),
      session: getAuthOptions().session,
      debug: getAuthOptions().debug,
    },
    oauth: {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      error,
      error_description,
    }
  }
  
  res.status(200).json(debugInfo)
}
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***hidden***' : 'MISSING',
    CIDAAS_CLIENT_ID: process.env.CIDAAS_CLIENT_ID ? '***hidden***' : 'MISSING',
    CIDAAS_CLIENT_SECRET: process.env.CIDAAS_CLIENT_SECRET ? '***hidden***' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  }

  res.status(200).json(envVars)
}
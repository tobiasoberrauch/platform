import { GetServerSideProps } from 'next'

interface Props {
  envCheck: {
    nextauthUrl: boolean
    nextauthSecret: boolean
    cidaasClientId: boolean
    cidaasClientSecret: boolean
    supabaseUrl: boolean
    supabaseServiceKey: boolean
  }
}

export default function TestEnv({ envCheck }: Props) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      <div className="space-y-2">
        <div>NEXTAUTH_URL: {envCheck.nextauthUrl ? '✅ Loaded' : '❌ Missing'}</div>
        <div>NEXTAUTH_SECRET: {envCheck.nextauthSecret ? '✅ Loaded' : '❌ Missing'}</div>
        <div>CIDAAS_CLIENT_ID: {envCheck.cidaasClientId ? '✅ Loaded' : '❌ Missing'}</div>
        <div>CIDAAS_CLIENT_SECRET: {envCheck.cidaasClientSecret ? '✅ Loaded' : '❌ Missing'}</div>
        <div>NEXT_PUBLIC_SUPABASE_URL: {envCheck.supabaseUrl ? '✅ Loaded' : '❌ Missing'}</div>
        <div>SUPABASE_SERVICE_ROLE_KEY: {envCheck.supabaseServiceKey ? '✅ Loaded' : '❌ Missing'}</div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      envCheck: {
        nextauthUrl: !!process.env.NEXTAUTH_URL,
        nextauthSecret: !!process.env.NEXTAUTH_SECRET,
        cidaasClientId: !!process.env.CIDAAS_CLIENT_ID,
        cidaasClientSecret: !!process.env.CIDAAS_CLIENT_SECRET,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }
  }
}
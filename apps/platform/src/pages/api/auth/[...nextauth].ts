import NextAuth from 'next-auth'
import { getAuthOptions } from '@digital-platform/config'

export default NextAuth(getAuthOptions())
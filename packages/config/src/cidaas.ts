import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export interface CidaasUser {
  sub: string
  given_name?: string
  family_name?: string
  email: string
  email_verified?: boolean
  picture?: string
  roles?: string[]
  groups?: string[]
  user_status?: string
  created_time?: string
  updated_time?: string
}

export interface CidaasUsersResponse {
  success: boolean
  status: number
  data?: {
    data: CidaasUser[]
    total_count: number
  }
  error?: string
}

export interface CidaasSearchParams {
  limit?: number
  offset?: number
  order_by?: 'created_time' | 'updated_time' | 'email' | 'given_name' | 'family_name'
  order?: 'asc' | 'desc'
  search?: string
  filter?: {
    email?: string
    given_name?: string
    family_name?: string
    user_status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  }
}

export interface CidaasGraphSearchParams {
  from?: number
  size?: number
  rangefield?: string
  time_zone?: string
  from_value?: string
  to_value?: string
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

/**
 * Fetch users from cidaas using the user management API
 * Requires cidaas:users_read and cidaas:users_search scopes
 */
export async function fetchCidaasUsers(
  accessToken: string,
  params: CidaasSearchParams = {}
): Promise<CidaasUsersResponse> {
  const {
    limit = 50,
    offset = 0,
    order_by = 'created_time',
    order = 'desc',
    search,
    filter
  } = params

  try {
    const baseUrl = 'https://audius-prod.cidaas.eu'
    // Use cidaas Admin API for user management
    // Note: This requires the cidaas:users_read scope
    const url = new URL(`${baseUrl}/users-mgmt-srv/users`)
    
    // Add query parameters
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('offset', offset.toString())
    url.searchParams.append('order_by', order_by)
    url.searchParams.append('order', order)
    
    if (search) {
      url.searchParams.append('q', search)
    }
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value)
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      status: response.status,
      data: data
    }
  } catch (error) {
    console.error('Error fetching cidaas users:', error)
    return {
      success: false,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Fetch users from cidaas using the user-srv graph API
 * This is a more advanced endpoint with better filtering capabilities
 * Requires cidaas:users_read and cidaas:users_search scopes
 */
export async function fetchCidaasUsersGraph(
  accessToken: string,
  params: CidaasGraphSearchParams = {}
): Promise<CidaasUsersResponse> {
  const {
    from = 0,
    size = 50,
    rangefield,
    time_zone,
    from_value,
    to_value,
    sortfield = 'created_time',
    descending = true,
    fieldsFilter = [],
    groupsFilter = [],
    terms = [],
    excludeUserCount = false,
    fields,
    groupsCondition = 'and'
  } = params

  try {
    const baseUrl = 'https://audius-prod.cidaas.eu'
    const url = `${baseUrl}/user-srv/graph/users`
    
    const requestBody = {
      from,
      size,
      ...(rangefield && { rangefield }),
      ...(time_zone && { time_zone }),
      ...(from_value && { from_value }),
      ...(to_value && { to_value }),
      sortfield,
      descending,
      fieldsFilter,
      groupsFilter,
      terms,
      excludeUserCount,
      ...(fields && { fields }),
      groupsCondition
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      status: response.status,
      data: data
    }
  } catch (error) {
    console.error('Error fetching cidaas users via graph API:', error)
    return {
      success: false,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get a specific user by ID from cidaas
 */
export async function fetchCidaasUser(
  accessToken: string,
  userId: string
): Promise<{ success: boolean; data?: CidaasUser; error?: string }> {
  try {
    const baseUrl = 'https://audius-prod.cidaas.eu'
    const response = await fetch(`${baseUrl}/users-srv/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('Error fetching cidaas user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Helper function to get access token from NextAuth session
 */
export async function getAccessTokenFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    return token?.accessToken as string || null
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}
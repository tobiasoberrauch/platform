import { useState, useEffect } from 'react'
import { type CidaasUser, type CidaasSearchParams } from '@digital-platform/config'

interface UseCidaasUsersResult {
  users: CidaasUser[]
  totalCount: number
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCidaasUsersParams extends Omit<CidaasSearchParams, 'filter'> {
  filter?: {
    email?: string
    given_name?: string
    family_name?: string
    user_status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  }
  enabled?: boolean
}

export function useCidaasUsers(params: UseCidaasUsersParams = {}): UseCidaasUsersResult {
  const [users, setUsers] = useState<CidaasUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    limit = 50,
    offset = 0,
    order_by = 'created_time',
    order = 'desc',
    search,
    filter,
    enabled = true
  } = params

  const fetchUsers = async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('limit', limit.toString())
      queryParams.append('offset', offset.toString())
      queryParams.append('order_by', order_by)
      queryParams.append('order', order)

      if (search) queryParams.append('search', search)
      if (filter?.email) queryParams.append('email', filter.email)
      if (filter?.given_name) queryParams.append('given_name', filter.given_name)
      if (filter?.family_name) queryParams.append('family_name', filter.family_name)
      if (filter?.user_status) queryParams.append('user_status', filter.user_status)

      const response = await fetch(`/api/cidaas/users?${queryParams}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.data || [])
      setTotalCount(data.total_count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUsers([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [limit, offset, order_by, order, search, filter?.email, filter?.given_name, filter?.family_name, filter?.user_status, enabled])

  return {
    users,
    totalCount,
    loading,
    error,
    refetch: fetchUsers
  }
}
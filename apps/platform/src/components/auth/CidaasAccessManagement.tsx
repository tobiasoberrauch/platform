import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserAccess {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  applications: string[]
  functions: string[]
  permissions: string[]
  appliedRules: string[]
  hasAccess: boolean
}

interface SyncStats {
  total: number
  withAccess: number
  byRole: {
    admin: number
    user: number
    guest: number
  }
  byApplication: {
    platform: number
    benchmark: number
    csrd: number
    support: number
  }
}

interface SyncResponse {
  success: boolean
  message: string
  usingMockData?: boolean
  stats: SyncStats
  users: UserAccess[]
}

export const CidaasAccessManagement: React.FC = () => {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserAccess[]>([])
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'guest'>('all')
  const [accessFilter, setAccessFilter] = useState<'all' | 'with-access' | 'no-access'>('all')

  const syncUsers = async () => {
    if (!session?.user) {
      setError('No session available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/sync-cidaas-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data: SyncResponse = await response.json()
        setUsers(data.users)
        setStats(data.stats)
        setUsingMockData(data.usingMockData || false)
        console.log('Sync completed:', data.stats)
      } else {
        const errorData = await response.json()
        setError(`Sync failed: ${errorData.error}`)
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    // Access filter
    const matchesAccess = accessFilter === 'all' || 
                         (accessFilter === 'with-access' && user.hasAccess) ||
                         (accessFilter === 'no-access' && !user.hasAccess)
    
    return matchesSearch && matchesRole && matchesAccess
  })

  const getApplicationBadgeColor = (app: string) => {
    const colors = {
      platform: 'bg-gray-500',
      benchmark: 'bg-blue-500',
      csrd: 'bg-green-500',
      support: 'bg-purple-500'
    }
    return colors[app as keyof typeof colors] || 'bg-gray-500'
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-500',
      user: 'bg-blue-500',
      guest: 'bg-gray-500'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cidaas Access Management</h2>
          <button
            onClick={syncUsers}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            {loading ? 'Syncing...' : 'Sync Users from Cidaas'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {usingMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <span className="font-medium text-yellow-800">Demo Modus</span>
                <p className="text-sm text-yellow-700">
                  Cidaas API ist nicht verfügbar. Es werden Beispieldaten verwendet, um die Zugriffskontrolle zu demonstrieren.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">User Statistics</h3>
              <div className="space-y-1 text-sm">
                <div>Total Users: <span className="font-mono">{stats.total}</span></div>
                <div>With Access: <span className="font-mono">{stats.withAccess}</span></div>
                <div>No Access: <span className="font-mono">{stats.total - stats.withAccess}</span></div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">By Role</h3>
              <div className="space-y-1 text-sm">
                <div>Admins: <span className="font-mono">{stats.byRole.admin}</span></div>
                <div>Users: <span className="font-mono">{stats.byRole.user}</span></div>
                <div>Guests: <span className="font-mono">{stats.byRole.guest}</span></div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">By Application</h3>
              <div className="space-y-1 text-sm">
                <div>Platform: <span className="font-mono">{stats.byApplication.platform}</span></div>
                <div>Benchmark: <span className="font-mono">{stats.byApplication.benchmark}</span></div>
                <div>CSRD: <span className="font-mono">{stats.byApplication.csrd}</span></div>
                <div>Support: <span className="font-mono">{stats.byApplication.support}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
          </select>
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Access</option>
            <option value="with-access">With Access</option>
            <option value="no-access">No Access</option>
          </select>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  {!user.hasAccess && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      No Access
                    </span>
                  )}
                </div>
              </div>

              {user.applications.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Applications:</span>
                  <div className="flex flex-wrap gap-1">
                    {user.applications.map(app => (
                      <span key={app} className={`px-2 py-1 rounded text-xs font-medium text-white ${getApplicationBadgeColor(app)}`}>
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.functions.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Functions:</span>
                  <span className="text-sm text-gray-600">{user.functions.join(', ')}</span>
                </div>
              )}

              {user.appliedRules.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 mr-2">Applied Rules:</span>
                  <span className="text-sm text-gray-600">{user.appliedRules.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No users match the current filters
          </div>
        )}
      </div>
    </div>
  )
}
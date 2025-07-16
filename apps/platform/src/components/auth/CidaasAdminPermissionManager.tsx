'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CidaasAccessManagement } from './CidaasAccessManagement';
import { 
  getAppConfigs, 
  getCurrentUser, 
  updatePermissions, 
  getPermissionOverrides,
  fetchCidaasUsers,
  getAccessTokenFromRequest,
  type AppConfig, 
  type AppFunction, 
  type User,
  type Company,
  type PermissionUpdate,
  getCompanies
} from '@digital-platform/config';

interface CidaasAdminPermissionManagerProps {
  onClose?: () => void;
}

interface PermissionState {
  [key: string]: {
    enabled: boolean;
    requiredRole: 'admin' | 'user' | 'guest';
    requiredPermissions: string[];
  };
}

interface CidaasUser {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  user_status?: string;
  account_id?: string;
  subscription?: string;
  subscription_valid?: boolean;
  isub?: string;
  last_accessed_at?: number;
}

const CidaasUserManagement: React.FC = () => {
  const [users, setUsers] = useState<CidaasUser[]>([]);
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { data: session } = useSession();

  useEffect(() => {
    setCompanies(getCompanies());
  }, []);

  useEffect(() => {
    if (session) {
      loadUsers();
    }
  }, [session]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[CidaasUserManagement] Starting to load users...');

      // Load local mock users
      const mockUsers: User[] = [
        {
          id: 'user1',
          name: 'Max Mustermann',
          email: 'max@konstruktiv.de',
          role: 'admin',
          companyId: 'konstruktiv',
          permissions: ['benchmark.access', 'csrd.access', 'support.access'],
          isActive: true
        },
        {
          id: 'user2',
          name: 'Anna Schmidt', 
          email: 'anna@clevercompany.ai',
          role: 'user',
          companyId: 'konstruktiv',
          permissions: ['benchmark.access', 'benchmark.products'],
          isActive: true
        }
      ];
      setLocalUsers(mockUsers);

      // Try to load cidaas users if we have an access token
      if (session?.user && (session as any)?.accessToken) {
        console.log('[CidaasUserManagement] Session found, fetching cidaas users...');
        
        // Try the new graph API first
        try {
          console.log('[CidaasUserManagement] Trying graph API...');
          const graphResponse = await fetch('/api/admin/cidaas-users-graph', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 0,
              size: 100,
              sortfield: 'created_time',
              descending: true,
              fieldsFilter: [],
              groupsFilter: [],
              terms: [],
              excludeUserCount: false,
              groupsCondition: 'and'
            })
          });

          if (graphResponse.ok) {
            const graphData = await graphResponse.json();
            console.log('[CidaasUserManagement] Graph API Response:', graphData);
            
            if (graphData.success && graphData.data && Array.isArray(graphData.data)) {
              console.log('[CidaasUserManagement] Found', graphData.data.length, 'cidaas users via graph API');
              setUsers(graphData.data);
              return; // Success with graph API, no need to try fallback
            }
          } else {
            console.log('[CidaasUserManagement] Graph API failed, trying fallback...');
          }
        } catch (graphError) {
          console.error('[CidaasUserManagement] Graph API Error:', graphError);
        }

        // Fallback to original API
        try {
          console.log('[CidaasUserManagement] Trying original API...');
          const response = await fetch('/api/admin/cidaas-users', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('[CidaasUserManagement] Original API Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('[CidaasUserManagement] Original API Response data:', data);
            
            if (data.success && data.data?.data) {
              console.log('[CidaasUserManagement] Found', data.data.data.length, 'cidaas users');
              setUsers(data.data.data);
            } else if (data.data && Array.isArray(data.data)) {
              console.log('[CidaasUserManagement] Found', data.data.length, 'cidaas users (direct array)');
              setUsers(data.data);
            } else {
              console.warn('[CidaasUserManagement] No cidaas users found or unexpected data structure');
              setUsers([]);
            }
          } else {
            const errorData = await response.text();
            console.error('[CidaasUserManagement] Original API Error:', response.status, errorData);
            setError(`API Error: ${response.status} - ${response.statusText}`);
            setUsers([]);
          }
        } catch (apiError) {
          console.error('[CidaasUserManagement] Network Error:', apiError);
          setError(`Netzwerkfehler: ${apiError instanceof Error ? apiError.message : 'Unbekannter Fehler'}`);
          setUsers([]);
        }
      } else {
        console.log('[CidaasUserManagement] No session or access token available');
        setError('Keine gültige Session oder Access Token vorhanden');
      }
    } catch (err) {
      console.error('[CidaasUserManagement] General Error:', err);
      setError(`Fehler beim Laden der Benutzer: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.given_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const assignPermissionsToSelected = (permissions: string[]) => {
    // In a real app, this would sync selected cidaas users with local permission system
    console.log('Assigning permissions to selected users:', {
      users: Array.from(selectedUsers),
      permissions
    });
    
    // For demo, add selected cidaas users to local users with permissions
    const newLocalUsers = Array.from(selectedUsers).map(userId => {
      const cidaasUser = users.find(u => u.sub === userId);
      if (!cidaasUser) return null;
      
      return {
        id: cidaasUser.sub,
        name: cidaasUser.name || `${cidaasUser.given_name || ''} ${cidaasUser.family_name || ''}`.trim(),
        email: cidaasUser.email,
        role: 'user' as const,
        companyId: 'konstruktiv',
        permissions,
        isActive: cidaasUser.user_status === 'VERIFIED',
        cidaasId: cidaasUser.sub
      };
    }).filter(Boolean) as User[];

    setLocalUsers(prev => [...prev, ...newLocalUsers]);
    setSelectedUsers(new Set());
    alert(`${newLocalUsers.length} Benutzer wurden erfolgreich hinzugefügt!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cidaas Benutzer Verwaltung</h3>
          <p className="text-sm text-gray-500">
            Verwalten Sie Benutzer aus cidaas und weisen Sie ihnen Berechtigungen zu
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span> 
          {loading ? 'Lade Benutzer...' : 'Benutzer aktualisieren'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Benutzer suchen (Name, E-Mail)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {selectedUsers.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => assignPermissionsToSelected(['benchmark.access'])}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Benchmark zuweisen ({selectedUsers.size})
            </button>
            <button
              onClick={() => assignPermissionsToSelected(['csrd.access'])}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              CSRD zuweisen ({selectedUsers.size})
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600">Cidaas Benutzer</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.user_status === 'VERIFIED').length}
          </div>
          <div className="text-sm text-gray-600">Verifiziert</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.subscription_valid).length}
          </div>
          <div className="text-sm text-gray-600">Aktive Subscription</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{localUsers.length}</div>
          <div className="text-sm text-gray-600">Lokale Benutzer</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cidaas Users */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">
                Cidaas Benutzer ({filteredUsers.length})
              </h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Keine Benutzer gefunden' : 'Keine cidaas Benutzer verfügbar'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <div key={user.sub} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.sub)}
                          onChange={() => toggleUserSelection(user.sub)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {user.name || `${user.given_name || ''} ${user.family_name || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="flex gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.user_status === 'VERIFIED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.user_status || 'Unknown'}
                            </span>
                            {user.subscription && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.subscription_valid 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.subscription}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Local Users with Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">
                Lokale Benutzer mit Berechtigungen ({localUsers.length})
              </h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {localUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Keine lokalen Benutzer konfiguriert
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {localUsers.map(user => (
                    <div key={user.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="flex gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Aktiv' : 'Inaktiv'}
                            </span>
                            {(user as any).cidaasId && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Cidaas
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs text-gray-600">
                              Berechtigungen: {user.permissions.join(', ')}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setLocalUsers(prev => prev.filter(u => u.id !== user.id));
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Permission Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Berechtigungs-Vorlagen</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => selectedUsers.size > 0 && assignPermissionsToSelected(['benchmark.access', 'benchmark.products', 'benchmark.market'])}
            disabled={selectedUsers.size === 0}
            className="p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-gray-900">Benchmark Vollzugriff</div>
            <div className="text-sm text-gray-500">Alle Benchmark-Funktionen</div>
          </button>
          <button
            onClick={() => selectedUsers.size > 0 && assignPermissionsToSelected(['csrd.access', 'csrd.analysis'])}
            disabled={selectedUsers.size === 0}
            className="p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-gray-900">CSRD Standard</div>
            <div className="text-sm text-gray-500">Grundlegende CSRD-Funktionen</div>
          </button>
          <button
            onClick={() => selectedUsers.size > 0 && assignPermissionsToSelected(['support.access', 'support.tickets'])}
            disabled={selectedUsers.size === 0}
            className="p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-gray-900">Support Team</div>
            <div className="text-sm text-gray-500">Support-Funktionen</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export const CidaasAdminPermissionManager: React.FC<CidaasAdminPermissionManagerProps> = ({ onClose }) => {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>({});
  const [pendingChanges, setPendingChanges] = useState<PermissionUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<'apps' | 'permissions' | 'users' | 'cidaas' | 'access-control'>('cidaas');
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    // Check if user has admin access (either from config or session email)
    const isAdmin = currentUser.role === 'admin' || 
                   session?.user?.email?.includes('admin') ||
                   session?.user?.email?.includes('tobias.oberrauch@audius.de');

    if (!isAdmin) {
      return;
    }

    setUser(currentUser);
    const allApps = getAppConfigs();
    setApps(allApps);

    // Initialize permission state
    const initialState: PermissionState = {};
    const overrides = getPermissionOverrides();

    allApps.forEach(app => {
      const appKey = app.id;
      const appOverride = overrides[appKey];
      
      initialState[appKey] = {
        enabled: appOverride?.enabled ?? app.isEnabled ?? true,
        requiredRole: appOverride?.requiredRole ?? app.requiredRole ?? 'user',
        requiredPermissions: appOverride?.requiredPermissions ?? app.requiredPermissions ?? []
      };

      if (app.functions) {
        app.functions.forEach(func => {
          const funcKey = `${app.id}.${func.id}`;
          const funcOverride = overrides[funcKey];
          
          initialState[funcKey] = {
            enabled: funcOverride?.enabled ?? func.isEnabled ?? true,
            requiredRole: funcOverride?.requiredRole ?? func.requiredRole ?? 'user',
            requiredPermissions: funcOverride?.requiredPermissions ?? func.requiredPermissions ?? []
          };
        });
      }
    });

    setPermissionState(initialState);
    setIsLoading(false);
  }, [session]);

  const updatePermissionState = (key: string, field: keyof PermissionState[string], value: any) => {
    setPermissionState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));

    // Track pending changes
    const [appId, funcId] = key.split('.');
    const update: PermissionUpdate = {
      type: funcId ? 'function' : 'app',
      id: funcId || appId,
      appId: funcId ? appId : undefined,
      enabled: field === 'enabled' ? value : permissionState[key]?.enabled ?? true,
      requiredRole: field === 'requiredRole' ? value : permissionState[key]?.requiredRole ?? 'user',
      requiredPermissions: field === 'requiredPermissions' ? value : permissionState[key]?.requiredPermissions ?? []
    };

    setPendingChanges(prev => {
      const filtered = prev.filter(change => {
        if (change.type === 'app') return change.id !== update.id;
        return !(change.id === update.id && change.appId === update.appId);
      });
      return [...filtered, update];
    });
  };

  const saveChanges = () => {
    updatePermissions(pendingChanges);
    setPendingChanges([]);
    alert('Änderungen erfolgreich gespeichert!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check admin access
  const isAdmin = user?.role === 'admin' || 
                 session?.user?.email?.includes('admin') ||
                 session?.user?.email?.includes('tobias.oberrauch@audius.de');

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Zugriff verweigert</h3>
            <p className="text-sm text-red-700">Sie benötigen Administrator-Rechte um diese Seite zu sehen.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">App & Funktionen Verwaltung</h2>
            <p className="text-sm text-gray-500 mt-1">
              Verwalten Sie Berechtigungen für Apps und deren Funktionen mit cidaas Integration
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('cidaas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'cidaas'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🔐 Cidaas Benutzer
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'apps'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Apps & Funktionen
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ⚙️ Berechtigungen
          </button>
          <button
            onClick={() => setActiveTab('access-control')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'access-control'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🎯 Zugriffskontrolle
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Lokale Benutzer
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
        {activeTab === 'cidaas' && (
          <CidaasUserManagement />
        )}

        {activeTab === 'apps' && (
          <div className="space-y-6">
            {apps.map(app => (
              <div key={app.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* App Header */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r ${app.gradient} rounded-lg`}>
                        <span className="text-white text-lg">{app.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* App Enabled Toggle */}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={permissionState[app.id]?.enabled ?? true}
                          onChange={(e) => updatePermissionState(app.id, 'enabled', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">App aktiviert</span>
                      </label>

                      {/* App Role */}
                      <select
                        value={permissionState[app.id]?.requiredRole ?? 'user'}
                        onChange={(e) => updatePermissionState(app.id, 'requiredRole', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="guest">Guest</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Functions */}
                {app.functions && app.functions.length > 0 && (
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Funktionen</h4>
                    <div className="space-y-3">
                      {app.functions.map(func => {
                        const funcKey = `${app.id}.${func.id}`;
                        return (
                          <div key={func.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{func.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">{func.name}</div>
                                <div className="text-sm text-gray-500">{func.description}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Function Enabled Toggle */}
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={permissionState[funcKey]?.enabled ?? true}
                                  onChange={(e) => updatePermissionState(funcKey, 'enabled', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Aktiviert</span>
                              </label>

                              {/* Function Role */}
                              <select
                                value={permissionState[funcKey]?.requiredRole ?? 'user'}
                                onChange={(e) => updatePermissionState(funcKey, 'requiredRole', e.target.value)}
                                className="text-sm border border-gray-300 rounded px-3 py-1"
                              >
                                <option value="guest">Guest</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Cidaas Integration</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Authentifiziert:</strong> {session?.user?.email}</p>
                <p><strong>Session Status:</strong> {session ? 'Aktiv' : 'Nicht angemeldet'}</p>
                <p><strong>Access Token:</strong> {(session as any)?.accessToken ? 'Verfügbar' : 'Nicht verfügbar'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Verfügbare Berechtigungen</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>benchmark.access</span>
                    <span className="text-gray-500">Zugriff auf Benchmark-App</span>
                  </div>
                  <div className="flex justify-between">
                    <span>benchmark.products</span>
                    <span className="text-gray-500">Produkt-Benchmarks</span>
                  </div>
                  <div className="flex justify-between">
                    <span>csrd.access</span>
                    <span className="text-gray-500">Zugriff auf CSRD-App</span>
                  </div>
                  <div className="flex justify-between">
                    <span>support.access</span>
                    <span className="text-gray-500">Zugriff auf Support-App</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Aktuelle Konfiguration</h4>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Ausstehende Änderungen:</strong> {pendingChanges.length}
                  </p>
                  {pendingChanges.length > 0 && (
                    <div className="space-y-1">
                      {pendingChanges.slice(0, 5).map((change, index) => (
                        <div key={index} className="text-xs bg-yellow-50 px-2 py-1 rounded">
                          {change.type === 'app' ? `App: ${change.id}` : `Funktion: ${change.appId}.${change.id}`}
                          {!change.enabled && ' (deaktiviert)'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'access-control' && (
          <CidaasAccessManagement />
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Legacy Benutzer Verwaltung</h3>
              <p className="text-sm text-orange-800">
                Diese Funktion wird durch die cidaas Integration ersetzt. 
                Verwenden Sie den "Cidaas Benutzer" Tab für die moderne Benutzerverwaltung.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {pendingChanges.length > 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {pendingChanges.length} Änderung{pendingChanges.length !== 1 ? 'en' : ''} ausstehend
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zurücksetzen
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
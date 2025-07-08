import React, { useState, useEffect } from 'react';
import { 
  getAppConfigs, 
  getCurrentUser, 
  updatePermissions, 
  getPermissionOverrides,
  type AppConfig, 
  type AppFunction, 
  type User,
  type Company,
  type PermissionUpdate,
  getCompanies
} from '@digital-platform/config';

interface AdminPermissionManagerProps {
  onClose?: () => void;
}

interface PermissionState {
  [key: string]: {
    enabled: boolean;
    requiredRole: 'admin' | 'user' | 'guest';
    requiredPermissions: string[];
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'guest',
    companyId: '',
    permissions: [] as string[]
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load mock users and companies
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
        companyId: 'clevercompany',
        permissions: ['benchmark.access', 'benchmark.products'],
        isActive: true
      },
      {
        id: 'user3',
        name: 'Tom Weber',
        email: 'tom@konstruktiv.de',
        role: 'user',
        companyId: 'konstruktiv',
        permissions: ['csrd.access', 'csrd.analysis'],
        isActive: false
      }
    ];
    setUsers(mockUsers);
    setCompanies(getCompanies());
  }, []);

  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.companyId) return;
    
    const user: User = {
      id: `user${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      companyId: newUser.companyId,
      permissions: newUser.permissions,
      isActive: true
    };
    
    setUsers(prev => [...prev, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      companyId: '',
      permissions: []
    });
    setShowAddForm(false);
  };

  const updateUserCompany = (userId: string, companyId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, companyId } : user
    ));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const updateUserRole = (userId: string, role: 'admin' | 'user' | 'guest') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role } : user
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Benutzer Verwaltung</h3>
          <p className="text-sm text-gray-500">Verwalten Sie Benutzer und deren Gruppenzugehörigkeit</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Neuer Benutzer
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Neuen Benutzer hinzufügen</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="max@firma.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma/Gruppe</label>
              <select
                value={newUser.companyId}
                onChange={(e) => setNewUser(prev => ({ ...prev, companyId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Firma auswählen</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' | 'guest' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="guest">Guest</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addUser}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Benutzer hinzufügen
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma/Gruppe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berechtigungen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => {
                const company = companies.find(c => c.id === user.companyId);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.companyId}
                        onChange={(e) => updateUserCompany(user.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'user' | 'guest')}
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="guest">Guest</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ 
                          user.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {user.isActive ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        {user.permissions.length} Berechtigungen
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Bearbeiten
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companies.map(company => {
          const companyUsers = users.filter(u => u.companyId === company.id);
          const activeUsers = companyUsers.filter(u => u.isActive);
          return (
            <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{company.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gesamt Benutzer:</span>
                  <span className="font-medium">{companyUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktive Benutzer:</span>
                  <span className="font-medium text-green-600">{activeUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admins:</span>
                  <span className="font-medium">{companyUsers.filter(u => u.role === 'admin').length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AdminPermissionManager: React.FC<AdminPermissionManagerProps> = ({ onClose }) => {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>({});
  const [pendingChanges, setPendingChanges] = useState<PermissionUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<'apps' | 'permissions' | 'users'>('apps');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser.role !== 'admin') {
      // Not authorized
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
  }, []);

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
    
    // Show success message (you could add a toast notification here)
    alert('Änderungen erfolgreich gespeichert!');
  };

  const resetChanges = () => {
    // Reload from storage
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
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
              Verwalten Sie Berechtigungen für Apps und deren Funktionen
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
            Berechtigungen
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Benutzer
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
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
                      {/* App Clickable Toggle */}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={app.isClickable ?? true}
                          onChange={(e) => {
                            // Update app clickable state
                            const newApps = apps.map(a => 
                              a.id === app.id ? { ...a, isClickable: e.target.checked } : a
                            );
                            setApps(newApps);
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">App anklickbar</span>
                      </label>

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
              <h3 className="font-semibold text-blue-900 mb-2">Berechtigungssystem</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Guest:</strong> Keine Anmeldung erforderlich, minimale Rechte</p>
                <p><strong>User:</strong> Angemeldete Benutzer mit Standard-Rechten</p>
                <p><strong>Admin:</strong> Administratoren mit erweiterten Rechten</p>
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
                    <span>benchmark.market</span>
                    <span className="text-gray-500">Marktanalysen</span>
                  </div>
                  <div className="flex justify-between">
                    <span>benchmark.competitive</span>
                    <span className="text-gray-500">Wettbewerbsanalysen</span>
                  </div>
                  <div className="flex justify-between">
                    <span>csrd.access</span>
                    <span className="text-gray-500">Zugriff auf CSRD-App</span>
                  </div>
                  <div className="flex justify-between">
                    <span>csrd.analysis</span>
                    <span className="text-gray-500">Wesentlichkeitsanalyse</span>
                  </div>
                  <div className="flex justify-between">
                    <span>csrd.reporting</span>
                    <span className="text-gray-500">CSRD-Berichterstattung</span>
                  </div>
                  <div className="flex justify-between">
                    <span>support.access</span>
                    <span className="text-gray-500">Zugriff auf Support-App</span>
                  </div>
                  <div className="flex justify-between">
                    <span>support.tickets</span>
                    <span className="text-gray-500">Ticket-Verwaltung</span>
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
                      {pendingChanges.length > 5 && (
                        <div className="text-xs text-gray-500">
                          ... und {pendingChanges.length - 5} weitere
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement />
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
                onClick={resetChanges}
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
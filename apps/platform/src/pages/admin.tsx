import type { NextPage } from 'next';
import { AuthenticatedLayout } from '../components/auth';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getCompanies, getCurrentCompanyId, setCurrentCompanyId, type Company } from '@digital-platform/config';

const AdminPage: NextPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: session } = useSession();
  
  useEffect(() => {
    setIsHydrated(true);
    setCompanies(getCompanies());
    setSelectedCompany(getCurrentCompanyId());
  }, []);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setCurrentCompanyId(companyId);
    window.location.reload();
  };

  // Use actual authenticated user
  const user = session?.user;

  const stats = {
    totalUsers: 1234,
    activeUsers: 892,
    totalProducts: 4,
    systemHealth: 98.5,
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'products', label: 'Product Settings', icon: '📱' },
    { id: 'companies', label: 'Company Settings', icon: '🏢' }, // Neu hinzugefügt
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔌' },
    { id: 'logs', label: 'Activity Logs', icon: '📋' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' },
  ];

  return (
    <AuthenticatedLayout title="Admin Dashboard" showProductSelector={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Menu</h2>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Products</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">System Health</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}%</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💚</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authenticated User Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Admin User</h2>
                  {user ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {user.image ? (
                          <img src={user.image} alt={user.name || 'User'} className="w-full h-full rounded-full" />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{user.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {user.email?.includes('admin') ? 'Administrator' : 'User'}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active Session
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No user session found</div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {[
                      { user: 'John Doe', action: 'logged in', time: '2 minutes ago' },
                      { user: 'Jane Smith', action: 'updated profile', time: '15 minutes ago' },
                      { user: 'Mike Johnson', action: 'accessed CSRD app', time: '1 hour ago' },
                      { user: 'Sarah Williams', action: 'exported data', time: '2 hours ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-medium text-gray-900">{activity.user}</span>
                          <span className="text-gray-600"> {activity.action}</span>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add User
                  </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active', lastActive: '2 min ago' },
                        { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active', lastActive: '1 hour ago' },
                        { name: 'Mike Johnson', email: 'mike@example.com', role: 'User', status: 'Inactive', lastActive: '3 days ago' },
                      ].map((user, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActive}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'products' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Product Settings</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Platform', icon: '🏠', status: 'Active', users: 1234 },
                    { name: 'Benchmark', icon: '📊', status: 'Active', users: 892 },
                    { name: 'CSRD', icon: '🌱', status: 'Active', users: 567 },
                    { name: 'Support', icon: '🛠️', status: 'Beta', users: 234 },
                  ].map((product) => (
                    <div key={product.name} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                            {product.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.users} active users</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-700">Configure</button>
                        <span className="text-gray-300">•</span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">View Analytics</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'companies' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Firmeneinstellungen</h1>
                
                {/* Aktuelle Firmenauswahl */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktive Firma</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma auswählen
                      </label>
                      {isHydrated && (
                        <select
                          value={selectedCompany}
                          onChange={(e) => handleCompanyChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.displayName}
                              {company.type === 'subsidiary' && ' (Tochtergesellschaft)'}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    {/* Firmen-Details */}
                    {isHydrated && selectedCompany && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        {(() => {
                          const company = companies.find(c => c.id === selectedCompany);
                          if (!company) return null;
                          
                          return (
                            <div>
                              <h3 className="font-medium text-gray-900 mb-2">{company.displayName}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Typ:</span>
                                  <span className="ml-2 font-medium">
                                    {company.type === 'parent' ? 'Muttergesellschaft' : 'Tochtergesellschaft'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Theme:</span>
                                  <span className="ml-2 font-medium">{company.settings.theme}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600">Verfügbare Features:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {company.settings.features?.map((feature) => (
                                      <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()} {/* Diese schließende Klammer war das Problem */}
                      </div>
                    )}
                  </div>
                </div>

                {/* Firmenverwaltung */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Alle Firmen</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Neue Firma hinzufügen
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🏢</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{company.displayName}</h3>
                            <p className="text-sm text-gray-600">
                              {company.type === 'parent' ? 'Muttergesellschaft' : 'Tochtergesellschaft'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            company.id === selectedCompany 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.id === selectedCompany ? 'Aktiv' : 'Inaktiv'}
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">Bearbeiten</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Authentication</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Require 2FA for admin users</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Enable SSO</span>
                        <input type="checkbox" className="w-5 h-5 rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Session timeout (minutes)</span>
                        <input type="number" defaultValue="30" className="w-20 px-2 py-1 border border-gray-300 rounded" />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Password Policy</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Minimum password length</span>
                        <input type="number" defaultValue="8" className="w-20 px-2 py-1 border border-gray-300 rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Require special characters</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Password expiry (days)</span>
                        <input type="number" defaultValue="90" className="w-20 px-2 py-1 border border-gray-300 rounded" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminPage;
import type { NextPage } from 'next';
import { ImprovedLayout, ModernLayout } from '@digital-platform/ui';
import { useState, useEffect } from 'react';
import { getCompanies, getCurrentCompanyId, setCurrentCompanyId, type Company } from '@digital-platform/config';

const SettingsPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user' as const,
    avatar: 'JD',
  };

  useEffect(() => {
    setIsHydrated(true);
    setCompanies(getCompanies());
    setSelectedCompany(getCurrentCompanyId());
  }, []);

  const handleCompanyChange = async (companyId: string) => {
    setIsSaving(true);
    setSelectedCompany(companyId);
    setCurrentCompanyId(companyId);
    
    // Kurze Verzögerung für UX
    setTimeout(() => {
      setIsSaving(false);
      // Optional: Seite neu laden, um Änderungen zu übernehmen
      window.location.reload();
    }, 500);
  };

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: '⚙️' },
    { id: 'company', label: 'Firma', icon: '🏢' },
    { id: 'notifications', label: 'Benachrichtigungen', icon: '🔔' },
    { id: 'privacy', label: 'Datenschutz', icon: '🔒' },
  ];

  return (
    <ModernLayout title="Einstellungen" user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
          <p className="mt-2 text-gray-600">Verwalten Sie Ihre Konto- und Anwendungseinstellungen</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'general' && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Allgemeine Einstellungen</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sprache
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zeitzone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="Europe/Berlin">Europa/Berlin (CET)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="light">Hell</option>
                      <option value="dark">Dunkel</option>
                      <option value="auto">Automatisch</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Änderungen speichern
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Firmeneinstellungen</h2>
                
                <div className="space-y-6">
                  {/* Aktuelle Firmenauswahl */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktive Firma auswählen
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Wählen Sie die Firma aus, für die Sie arbeiten möchten. Diese Einstellung beeinflusst, 
                      welche Daten und Funktionen Ihnen zur Verfügung stehen.
                    </p>
                    
                    {isHydrated && (
                      <div className="space-y-3">
                        <select
                          value={selectedCompany}
                          onChange={(e) => handleCompanyChange(e.target.value)}
                          disabled={isSaving}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.displayName}
                              {company.type === 'subsidiary' && ' (Tochtergesellschaft)'}
                            </option>
                          ))}
                        </select>
                        
                        {isSaving && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Einstellungen werden gespeichert...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Firmen-Details */}
                  {isHydrated && selectedCompany && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {(() => {
                        const company = companies.find(c => c.id === selectedCompany);
                        if (!company) return null;
                        
                        return (
                          <div>
                            <h3 className="font-medium text-gray-900 mb-3">Firmendetails</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Name:</span>
                                <span className="ml-2 font-medium">{company.displayName}</span>
                              </div>
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
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Verfügbare Features:</span>
                                <div className="mt-2 flex flex-wrap gap-1">
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
                      })()} 
                    </div>
                  )}
                  
                  {/* Verfügbare Firmen */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Verfügbare Firmen</h3>
                    <div className="space-y-2">
                      {companies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm">🏢</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{company.displayName}</h4>
                              <p className="text-xs text-gray-600">
                                {company.type === 'parent' ? 'Muttergesellschaft' : 'Tochtergesellschaft'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            company.id === selectedCompany 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.id === selectedCompany ? 'Aktiv' : 'Verfügbar'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Benachrichtigungseinstellungen</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">E-Mail-Benachrichtigungen</h3>
                      <p className="text-sm text-gray-600">Erhalten Sie Updates per E-Mail</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Browser-Benachrichtigungen</h3>
                      <p className="text-sm text-gray-600">Erhalten Sie Push-Benachrichtigungen</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Wöchentliche Berichte</h3>
                      <p className="text-sm text-gray-600">Zusammenfassung der Aktivitäten</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Änderungen speichern
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Datenschutzeinstellungen</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Datensammlung</h3>
                      <p className="text-sm text-gray-600">Anonyme Nutzungsstatistiken sammeln</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Profil öffentlich</h3>
                      <p className="text-sm text-gray-600">Ihr Profil für andere Benutzer sichtbar machen</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Aktivitätsverlauf</h3>
                      <p className="text-sm text-gray-600">Ihre Aktivitäten für Berichte speichern</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Änderungen speichern
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ModernLayout>
  );
};

export default SettingsPage;
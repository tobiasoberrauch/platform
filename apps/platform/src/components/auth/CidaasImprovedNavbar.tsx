'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { AppSelectorDropdown } from '@digital-platform/ui';
import { CidaasAdminPermissionManager } from './CidaasAdminPermissionManager';
import { 
  getFilteredAppConfigs, 
  getCurrentAppId, 
  getCurrentUser,
  type AppConfig,
  type AppFunction,
  type Company,
  type User,
  getCurrentCompanyId,
  getCompanies
} from '@digital-platform/config';

interface CidaasImprovedNavbarProps {
  title?: string;
}

const ProductMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<string>('platform');
  const [isHydrated, setIsHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const apps = getFilteredAppConfigs();
  const currentApp = apps.find((app: AppConfig) => app.id === currentAppId) || apps[0];
  
  useEffect(() => {
    setCurrentAppId(getCurrentAppId());
    setIsHydrated(true);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFunctionSelect = (functionUrl: string) => {
    window.location.href = functionUrl;
    setIsOpen(false);
  };

  if (!isHydrated) {
    return null;
  }

  if (!currentApp.functions || currentApp.functions.length === 0) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Funktionen ({currentApp.functions.length})</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 bg-gradient-to-r ${currentApp.gradient || 'bg-blue-500'} rounded-md`}>
                <span className="text-white text-xs">{currentApp.icon}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{currentApp.name}</div>
                <div className="text-xs text-gray-500">Verfügbare Funktionen</div>
              </div>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="space-y-1">
                {currentApp.functions.map((func: AppFunction) => (
                  <button
                    key={func.id}
                    onClick={() => handleFunctionSelect(func.url)}
                    className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {func.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {func.description}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mt-0.5 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FunctionLinks: React.FC = () => {
  const [currentAppId, setCurrentAppId] = useState<string>('platform');
  const [isHydrated, setIsHydrated] = useState(false);
  
  const apps = getFilteredAppConfigs();
  const currentApp = apps.find((app: AppConfig) => app.id === currentAppId) || apps[0];
  
  useEffect(() => {
    setCurrentAppId(getCurrentAppId());
    setIsHydrated(true);
  }, []);
  
  if (!isHydrated) {
    return null;
  }
  
  if (!currentApp.functions || currentApp.functions.length === 0) {
    return null;
  }

  const handleFunctionSelect = (functionUrl: string) => {
    window.location.href = functionUrl;
  };

  return (
    <div className="flex items-center space-x-1">
      {currentApp.functions.map((func: AppFunction, index: number) => (
        <React.Fragment key={func.id}>
          {index > 0 && (
            <span className="text-gray-300 mx-1">|</span>
          )}
          <button
            onClick={() => handleFunctionSelect(func.url)}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title={func.description}
          >
            {func.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const CompanyIndicator: React.FC = () => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const companyId = getCurrentCompanyId();
    const companies = getCompanies();
    const company = companies.find((c: Company) => c.id === companyId);
    setCurrentCompany(company || null);
  }, []);

  if (!isHydrated || !currentCompany) {
    return null;
  }

  return (
    <span className="text-xs text-gray-600">Firma: {currentCompany.name}</span>
  );
};

export const CidaasImprovedNavbar: React.FC<CidaasImprovedNavbarProps> = ({ 
  title = 'Digital Platform'
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // NextAuth session
  const { data: session, status } = useSession();

  // Get current user from config system
  useEffect(() => {
    const realUser = getCurrentUser();
    setCurrentUser(realUser);
    setIsHydrated(true);
  }, []);

  // Show loading state
  if (status === 'loading' || !isHydrated) {
    return (
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Show login button if not authenticated
  if (!session) {
    return (
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <AppSelectorDropdown />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signIn('cidaas')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign In with Cidaas
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Use real session user data combined with config user role detection
  const sessionUser = session.user;
  const configUser = currentUser;
  const isAdmin = sessionUser?.email?.includes('admin') || configUser?.role === 'admin' || false;

  // Create combined user object
  const user = {
    name: sessionUser?.name || configUser?.name || 'User',
    email: sessionUser?.email || configUser?.email || 'No email',
    image: sessionUser?.image || (configUser as any)?.avatar,
    role: isAdmin ? 'admin' : 'user',
    id: (sessionUser as any)?.id || configUser?.id || 'unknown',
    permissions: configUser?.permissions || [],
    companyId: configUser?.companyId || 'konstruktiv',
    isActive: configUser?.isActive || true
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <AppSelectorDropdown />
              <FunctionLinks />
            </div>

            {/* Right Side: User Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full rounded-full" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'User'}</div>
                    <div className='text-xs'><CompanyIndicator /></div>
                  </div>
                  <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {user.role === 'admin' ? 'Administrator' : 'User'}
                      </div>
                    </div>
                    <div className="p-2">
                      <a href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">My Profile</span>
                      </a>
                      <a href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">Settings</span>
                      </a>
                      {user.role === 'admin' && (
                        <>
                          <div className="my-2 border-t border-gray-100"></div>
                          <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span className="text-sm text-gray-700">Admin Dashboard</span>
                          </a>
                          <button 
                            onClick={() => {
                              setShowUserManagement(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">User Management</span>
                          </button>
                          <button 
                            onClick={() => {
                              setShowAdminPanel(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span className="text-sm text-gray-700">App Berechtigungen</span>
                          </button>
                        </>
                      )}
                      <div className="my-2 border-t border-gray-100"></div>
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm text-gray-700">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cidaas Admin Permission Manager Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <CidaasAdminPermissionManager onClose={() => setShowAdminPanel(false)} />
          </div>
        </div>
      )}
    </>
  );
};
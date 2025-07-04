import React, { useState, useRef, useEffect } from 'react';
import { AppSelectorDropdown } from './AppSelectorDropdown';
import { getAppConfigs, getCurrentAppId, type AppFunction } from '@digital-platform/config';

interface ImprovedNavbarProps {
  title?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'user';
  };
}

const ProductMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<string>('platform'); // Default to platform
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const apps = getAppConfigs();
  const currentApp = apps.find(app => app.id === currentAppId) || apps[0];
  
  // Detect current app only after hydration
  useEffect(() => {
    setCurrentAppId(getCurrentAppId());
  }, []);
  
  // Debug logging
  console.log('ProductMenu Debug:', {
    currentAppId,
    currentApp: currentApp?.name,
    hasFunctions: !!currentApp?.functions,
    functionsCount: currentApp?.functions?.length || 0,
    functions: currentApp?.functions?.map(f => f.name) || []
  });
  
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

  // Show debug info if no functions available
  if (!currentApp.functions || currentApp.functions.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-red-500 bg-red-50 rounded">
        Debug: No functions for {currentApp.name} (ID: {currentAppId})
      </div>
    );
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
  const [currentAppId, setCurrentAppId] = useState<string>('platform'); // Default to platform
  const [isHydrated, setIsHydrated] = useState(false);
  
  const apps = getAppConfigs();
  const currentApp = apps.find(app => app.id === currentAppId) || apps[0];
  
  // Detect current app only after hydration
  useEffect(() => {
    setCurrentAppId(getCurrentAppId());
    setIsHydrated(true);
  }, []);
  
  // Don't render anything until hydrated to prevent mismatch
  if (!isHydrated) {
    return null;
  }
  
  // If no functions available, don't render anything
  if (!currentApp.functions || currentApp.functions.length === 0) {
    return null;
  }

  const handleFunctionSelect = (functionUrl: string) => {
    window.location.href = functionUrl;
  };

  return (
    <div className="flex items-center space-x-1">
      {currentApp.functions.map((func: AppFunction, index) => (
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

export const ImprovedNavbar: React.FC<ImprovedNavbarProps> = ({ 
  title = 'Digital Platform',
  user = { name: 'John Doe', email: 'john@example.com', role: 'user' }
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + App Selector + Function Links */}
          <div className="flex items-center space-x-6">
            <AppSelectorDropdown />
            <FunctionLinks />
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'User'}</div>
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
                      </>
                    )}
                    <div className="my-2 border-t border-gray-100"></div>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
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
  );
};
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  getFilteredAppConfigs, 
  getCurrentAppId, 
  getCurrentUser,
  type AppConfig, 
  type AppFunction 
} from '@digital-platform/config';

interface AppSelectorDropdownProps {
  className?: string;
}

interface FilteredItem {
  type: 'app' | 'function';
  app: AppConfig;
  function?: AppFunction;
  matchScore: number;
}

export const AppSelectorDropdown: React.FC<AppSelectorDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItems, setVisibleItems] = useState(50);
  const [currentAppId, setCurrentAppId] = useState<string>('platform'); // Default to platform
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Get filtered apps based on user permissions
  const apps = useMemo(() => {
    return user ? getFilteredAppConfigs(user) : getFilteredAppConfigs();
  }, [user]);
  
  const currentApp = apps.find(app => app.id === currentAppId) || apps[0];

  // Filtere und sortiere Apps und Funktionen basierend auf Suchbegriff
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      // Ohne Suchbegriff: zeige alle Apps mit ihren Funktionen
      const items: FilteredItem[] = [];
      apps.forEach(app => {
        items.push({ type: 'app', app, matchScore: 0 });
        if (app.functions) {
          app.functions.forEach(func => {
            items.push({ type: 'function', app, function: func, matchScore: 0 });
          });
        }
      });
      return items;
    }

    const searchLower = searchTerm.toLowerCase();
    const items: FilteredItem[] = [];

    apps.forEach(app => {
      // App-Match berechnen
      const appNameMatch = app.name.toLowerCase().includes(searchLower);
      const appDescMatch = app.description.toLowerCase().includes(searchLower);
      
      if (appNameMatch || appDescMatch) {
        const score = appNameMatch ? 10 : 5;
        items.push({ type: 'app', app, matchScore: score });
      }

      // Funktionen durchsuchen
      if (app.functions) {
        app.functions.forEach(func => {
          const funcNameMatch = func.name.toLowerCase().includes(searchLower);
          const funcDescMatch = func.description.toLowerCase().includes(searchLower);
          
          if (funcNameMatch || funcDescMatch) {
            const score = funcNameMatch ? 8 : 3;
            items.push({ type: 'function', app, function: func, matchScore: score });
          }
        });
      }
    });

    // Sortiere nach Relevanz
    return items.sort((a, b) => b.matchScore - a.matchScore);
  }, [apps, searchTerm]);

  // Virtualisierung: zeige nur sichtbare Items
  const displayedItems = filteredItems.slice(0, visibleItems);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fokussiere Suchfeld beim Öffnen
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Detect current app and user only after hydration
  useEffect(() => {
    setCurrentAppId(getCurrentAppId());
    setUser(getCurrentUser());
    setIsHydrated(true);
  }, []);

  // Infinite Scroll für Performance
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && visibleItems < filteredItems.length) {
      setVisibleItems(prev => Math.min(prev + 25, filteredItems.length));
    }
  };

  const handleAppSelect = (url: string) => {
    window.location.href = url;
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleFunctionSelect = (functionUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    window.location.href = functionUrl;
    setIsOpen(false);
    setSearchTerm('');
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-md animate-pulse"></div>
        <div className="hidden sm:block h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-lg font-medium rounded-lg transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r ${currentApp.gradient || 'bg-blue-500'} rounded-md`}>
          <span className="text-white text-xs">{currentApp.icon}</span>
        </div>
        <span className="hidden sm:block">{currentApp.name}</span>
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
        <div className="absolute left-0 mt-2 w-[500px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Suchfeld */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Apps und Funktionen durchsuchen..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleItems(50); // Reset virtualization
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setVisibleItems(50);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Ergebnisse */}
          <div 
            ref={scrollContainerRef}
            className="max-h-96 overflow-y-auto"
            onScroll={handleScroll}
          >
            <div className="p-2">
              {searchTerm && (
                <div className="px-3 py-2 text-xs text-gray-500">
                  {filteredItems.length} Ergebnis{filteredItems.length !== 1 ? 'se' : ''} gefunden
                  {visibleItems < filteredItems.length && ` (${visibleItems} von ${filteredItems.length} angezeigt)`}
                </div>
              )}
              
              {!searchTerm && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Anwendungen & Funktionen
                </div>
              )}

              <div className="space-y-1">
                {displayedItems.length === 0 ? (
                  <div className="px-3 py-8 text-center text-gray-500">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="text-sm">Keine Ergebnisse gefunden</div>
                    <div className="text-xs mt-1">Versuchen Sie einen anderen Suchbegriff</div>
                  </div>
                ) : (
                  displayedItems.map((item, index) => {
                    if (item.type === 'app') {
                      const isCurrentApp = item.app.id === currentAppId;
                      const isClickable = item.app.isClickable !== false;
                      
                      return (
                        <div
                          key={`app-${item.app.id}-${index}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                            isCurrentApp
                              ? 'bg-blue-50 cursor-default'
                              : isClickable
                              ? 'hover:bg-gray-50 cursor-pointer'
                              : 'opacity-60 cursor-not-allowed'
                          }`}
                          onClick={() => !isCurrentApp && isClickable && handleAppSelect(item.app.url)}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 bg-gradient-to-r ${item.app.gradient || 'bg-blue-500'} rounded-lg`}>
                            <span className="text-white text-sm">{item.app.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {highlightMatch(item.app.name, searchTerm)}
                              {isCurrentApp && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                  Aktiv
                                </span>
                              )}
                              {!isClickable && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  Nur Funktionen
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {highlightMatch(item.app.description, searchTerm)}
                            </div>
                            {item.app.functions && item.app.functions.length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.app.functions.length} Funktion{item.app.functions.length !== 1 ? 'en' : ''} verfügbar
                              </div>
                            )}
                          </div>
                          {isClickable && !isCurrentApp && (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <button
                          key={`func-${item.app.id}-${item.function?.id}-${index}`}
                          onClick={(e) => item.function && handleFunctionSelect(item.function.url, e)}
                          className="w-full flex items-start gap-3 px-3 py-2 ml-6 rounded-lg hover:bg-gray-50 transition-all duration-200 text-left border-l-2 border-gray-100 pl-4"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 text-sm">
                              {item.function && highlightMatch(item.function.name, searchTerm)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.function && highlightMatch(item.function.description, searchTerm)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              in {item.app.name}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    }
                  })
                )}
              </div>

              {/* Lade-Indikator für Virtualisierung */}
              {visibleItems < filteredItems.length && (
                <div className="px-3 py-2 text-center">
                  <div className="text-xs text-gray-500">Scrollen für weitere Ergebnisse...</div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <a
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Zurück zur Plattform-Startseite
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
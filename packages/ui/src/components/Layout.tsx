import React from 'react';
import { getAppConfigs, getCurrentAppId } from '@digital-platform/config';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showProductSelector?: boolean;
}

const navigationItems = getAppConfigs();

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Digital Platform',
  showProductSelector = false 
}) => {
  const handleNavigation = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <span className="text-white text-xl">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-xs text-gray-500">Digital Workspace</p>
              </div>
            </div>
            {showProductSelector && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-medium hidden sm:block">Quick Access:</span>
                <div className="flex space-x-2">
                  {navigationItems.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => handleNavigation(item.url)}
                      className={`group relative px-4 py-2 bg-gradient-to-r ${item.gradient} text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="hidden sm:inline text-sm">{item.name}</span>
                      </span>
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="relative">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-white text-sm">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Digital Platform</h3>
                <p className="text-xs text-gray-500">Powering your digital transformation</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Digital Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

'use client'

import React, { useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { getAppConfigs, getCurrentAppId } from '@digital-platform/config';
import { CidaasImprovedNavbar } from './CidaasImprovedNavbar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  title?: string;
  showProductSelector?: boolean;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ 
  children, 
  title = 'CleverCompany',
  showProductSelector = true
}) => {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while session is loading or component is mounting
  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CidaasImprovedNavbar title={title} />
        <main className="relative">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show sign in page if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CidaasImprovedNavbar title={title} />
        <main className="relative">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
              <p className="text-gray-600 mb-6">Please sign in to access this application.</p>
              <button
                onClick={() => signIn('cidaas')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In with Cidaas
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Use the new improved navbar */}
      <CidaasImprovedNavbar title={title} />

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-white text-sm">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CleverCompany</h3>
                <p className="text-xs text-gray-500">Powering your digital transformation</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-center sm:text-right">
              © 2024 CleverCompany. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
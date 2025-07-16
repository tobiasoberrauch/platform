'use client'

import React, { useState } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { AppSelectorDropdown } from '@digital-platform/ui';

interface AuthenticatedNavbarProps {
  title?: string;
}

export const AuthenticatedNavbar: React.FC<AuthenticatedNavbarProps> = ({ 
  title = 'Digital Platform'
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Show loading state
  if (status === 'loading') {
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
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
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

  const user = session.user;
  const isAdmin = user?.email?.includes('admin') || false;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <AppSelectorDropdown />
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || 'User'} className="w-full h-full rounded-full" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'User'}</div>
                </div>
                <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-sm text-gray-500">{user?.email || 'No email'}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {isAdmin ? 'Administrator' : 'User'}
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
                    {isAdmin && (
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
  );
};
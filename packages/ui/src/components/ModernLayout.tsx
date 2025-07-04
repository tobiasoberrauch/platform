import React from 'react';
import { ImprovedNavbar } from './ImprovedNavbar';

interface ModernLayoutProps {
  children: React.ReactNode;
  title?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'user';
  };
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ 
  children, 
  title = 'Digital Platform',
  user
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedNavbar title={title} user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
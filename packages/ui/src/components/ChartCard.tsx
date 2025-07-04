import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-card border border-gray-50 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
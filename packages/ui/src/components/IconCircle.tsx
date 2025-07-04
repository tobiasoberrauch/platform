import React from 'react';

interface IconCircleProps {
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const IconCircle: React.FC<IconCircleProps> = ({
  color,
  size = 'lg',
  icon,
  children,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-12 h-12 text-lg';
      case 'lg':
        return 'w-16 h-16 text-xl';
      case 'xl':
        return 'w-20 h-20 text-2xl';
      default:
        return 'w-16 h-16 text-xl';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      case 'cyan':
        return 'bg-cyan-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`${getSizeClasses()} ${getColorClasses()} rounded-full flex items-center justify-center text-white shadow-lg ${className}`}>
      {icon || children}
    </div>
  );
};

// Predefined icons for common use cases
export const AllProductsIcon: React.FC<{ size?: IconCircleProps['size'] }> = ({ size = 'lg' }) => (
  <IconCircle color="blue" size={size}>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  </IconCircle>
);

export const CompareIcon: React.FC<{ size?: IconCircleProps['size'] }> = ({ size = 'lg' }) => (
  <IconCircle color="green" size={size}>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  </IconCircle>
);

export const BenchmarkIcon: React.FC<{ size?: IconCircleProps['size'] }> = ({ size = 'lg' }) => (
  <IconCircle color="purple" size={size}>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </IconCircle>
);

export const StatsIcon: React.FC<{ size?: IconCircleProps['size'] }> = ({ size = 'md' }) => (
  <IconCircle color="blue" size={size}>
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  </IconCircle>
);
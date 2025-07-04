import React from 'react';

interface ProductFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonColor: 'blue' | 'green' | 'purple' | 'orange';
  onAction: () => void;
}

export const ProductFeatureCard: React.FC<ProductFeatureCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonColor,
  onAction
}) => {
  const getButtonClasses = () => {
    const baseClasses = "px-8 py-3 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all duration-200";
    
    switch (buttonColor) {
      case 'blue':
        return `${baseClasses} bg-blue-500 hover:bg-blue-600`;
      case 'green':
        return `${baseClasses} bg-green-500 hover:bg-green-600`;
      case 'purple':
        return `${baseClasses} bg-purple-500 hover:bg-purple-600`;
      case 'orange':
        return `${baseClasses} bg-orange-500 hover:bg-orange-600`;
      default:
        return `${baseClasses} bg-blue-500 hover:bg-blue-600`;
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-card border border-gray-50 text-center hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-center mb-6">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 leading-relaxed">
        {description}
      </p>
      
      <button 
        onClick={onAction}
        className={getButtonClasses()}
      >
        {buttonText}
      </button>
    </div>
  );
};
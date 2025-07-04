import React from 'react';
import { getAppConfigs, getCurrentAppId, type AppConfig } from '@digital-platform/config';

interface ProductSelectorProps {
  currentProduct?: string;
  className?: string;
}

const products: AppConfig[] = getAppConfigs();

export const ProductSelector: React.FC<ProductSelectorProps> = ({ 
  currentProduct,
  className = '' 
}) => {
  const handleNavigation = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm text-gray-500 font-medium">Navigate to:</span>
      <div className="flex space-x-2">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => handleNavigation(product.url)}
            disabled={currentProduct === product.id}
            className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
              currentProduct === product.id
                ? `bg-gradient-to-r ${product.gradient} text-white shadow-lg cursor-default`
                : `bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:${product.gradient} hover:text-white hover:scale-105 hover:shadow-lg border border-gray-200/50`
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{product.icon}</span>
              <span>{product.name}</span>
              {currentProduct === product.id && (
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-white/80 rounded-full animate-pulse ml-1"></span>
                </span>
              )}
            </span>
            {currentProduct !== product.id && (
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

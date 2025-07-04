import React, { useState, useRef, useEffect } from 'react';
import { getAppConfigs, getCurrentAppId } from '@digital-platform/config';

interface ProductDropdownProps {
  className?: string;
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const products = getAppConfigs();
  const currentAppId = getCurrentAppId();
  const currentProduct = products.find(p => p.id === currentAppId) || products[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (url: string) => {
    window.location.href = url;
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`flex items-center justify-center w-8 h-8 bg-gradient-to-r ${currentProduct.gradient} rounded-lg`}>
          <span className="text-white text-sm">{currentProduct.icon}</span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-gray-900">{currentProduct.name}</div>
          <div className="text-xs text-gray-500">Current Product</div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Switch Product
            </div>
            <div className="space-y-1">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleNavigation(product.url)}
                  disabled={product.id === currentAppId}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    product.id === currentAppId
                      ? 'bg-gray-50 cursor-not-allowed opacity-60'
                      : 'hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r ${product.gradient} rounded-lg`}>
                    <span className="text-white text-lg">{product.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {product.name}
                      {product.id === currentAppId && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </div>
                  {product.id !== currentAppId && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))}
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
              Back to Platform Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
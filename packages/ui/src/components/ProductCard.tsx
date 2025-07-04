import React from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  color: string;
  gradient?: string;
}

interface ProductCardProps {
  product: Product;
  onSelect: () => void;
  isSelected?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  isSelected = false 
}) => {
  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border border-white/50 overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 shadow-blue-500/25' : ''
      }`}
      onClick={onSelect}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient || 'from-gray-500 to-gray-700'} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${product.gradient || 'from-gray-500 to-gray-700'} shadow-lg`}>
            <span className="text-3xl text-white">{product.icon}</span>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Active
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {product.name}
        </h3>
        
        <p className="text-gray-600 leading-relaxed mb-6">
          {product.description}
        </p>
        
        <button 
          className={`w-full py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 transform group-hover:scale-105 bg-gradient-to-r ${product.gradient || 'from-gray-500 to-gray-700'} shadow-lg hover:shadow-xl`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <span>Launch {product.name}</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-colors duration-300"></div>
    </div>
  );
};

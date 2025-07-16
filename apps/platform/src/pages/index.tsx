import { useState } from 'react';
import { 
  ProductFeatureCard, 
  StatsCard, 
  ChartCard,
  AllProductsIcon,
  CompareIcon,
  BenchmarkIcon,
  StatsIcon
} from '@digital-platform/ui';
import { getAppConfigs, type AppConfig } from '@digital-platform/config';
import { AuthenticatedLayout } from '../components/auth';

// Filter out the platform app itself from the product list
const products: AppConfig[] = getAppConfigs().filter(app => app.id !== 'platform');

export default function HomePage() {
  const handleProductAction = (productType: string) => {
    const productMap: { [key: string]: string } = {
      'all-products': '/benchmark',
      'compare': '/csrd',
      'benchmark': '/support'
    };
    
    const url = productMap[productType];
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <AuthenticatedLayout title="CleverCompany">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Product Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <ProductFeatureCard
          title="All Products"
          description="Browse our comprehensive digital workspace solutions"
          icon={<AllProductsIcon />}
          buttonText="View Products"
          buttonColor="blue"
          onAction={() => handleProductAction('all-products')}
        />
        
        <ProductFeatureCard
          title="Product Compare"
          description="Compare different tools and services across platforms"
          icon={<CompareIcon />}
          buttonText="Start Comparison"
          buttonColor="green"
          onAction={() => handleProductAction('compare')}
        />
        
        <ProductFeatureCard
          title="Benchmarking"
          description="Analyze performance metrics and market positions"
          icon={<BenchmarkIcon />}
          buttonText="View Benchmarks"
          buttonColor="purple"
          onAction={() => handleProductAction('benchmark')}
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          title="Total Users"
          value="1,234"
          subtitle="Active platform users"
          icon={<StatsIcon />}
        />
        
        <StatsCard
          title="Products"
          value={products.length}
          subtitle="Available applications"
          icon={<StatsIcon />}
        />
        
        <StatsCard
          title="Uptime"
          value="99.9%"
          subtitle="System availability"
          icon={<StatsIcon />}
        />
        
        <StatsCard
          title="Performance"
          value="Fast"
          subtitle="Average response time"
          icon={<StatsIcon />}
        />
      </div>

      {/* Available Products */}
      <ChartCard
        title="Available Applications"
        subtitle="Access your digital workspace tools"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => window.location.href = product.url}
              className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div className={`w-12 h-12 ${product.gradient ? 'bg-gradient-to-r' : 'bg-blue-500'} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-white text-xl">{product.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
        </ChartCard>
      </div>
    </AuthenticatedLayout>
  );
}

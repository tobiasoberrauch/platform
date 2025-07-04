import React from 'react';
import { 
  ModernLayout, 
  ProductFeatureCard, 
  StatsCard, 
  ChartCard,
  AllProductsIcon,
  CompareIcon,
  BenchmarkIcon,
  StatsIcon
} from '@digital-platform/ui';

const ModernHomePage = () => {
  const handleProductAction = (productType: string) => {
    console.log(`Navigating to ${productType}`);
    // Handle navigation here
  };

  return (
    <ModernLayout title="cleverBenchmark">
      {/* Hero Section with Product Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <ProductFeatureCard
          title="Alle Produkte"
          description="Durchsuchen Sie unsere komplette Produktdatenbank"
          icon={<AllProductsIcon />}
          buttonText="Produkte ansehen"
          buttonColor="blue"
          onAction={() => handleProductAction('all-products')}
        />
        
        <ProductFeatureCard
          title="Produktvergleich"
          description="Vergleichen Sie Winkelschleifer verschiedener Hersteller"
          icon={<CompareIcon />}
          buttonText="Vergleich starten"
          buttonColor="green"
          onAction={() => handleProductAction('compare')}
        />
        
        <ProductFeatureCard
          title="Benchmarking"
          description="Analysieren Sie Marktpositionen und Wettbewerb"
          icon={<BenchmarkIcon />}
          buttonText="Benchmarking"
          buttonColor="purple"
          onAction={() => handleProductAction('benchmark')}
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <StatsCard
          title="Anzahl der Produkte am 1.5.2025"
          value="258"
          subtitle="Winkelschleifer in der Datenbank"
          icon={<StatsIcon />}
        />
        
        <StatsCard
          title="Anzahl der Produkte am 4.7.2025"
          value="457"
          subtitle="Winkelschleifer in der Datenbank"
          icon={<StatsIcon />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Markenverteilung vom 1.5.2025"
          subtitle="Produktanzahl pro Marke"
        >
          {/* Mock Chart Content */}
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Chart placeholder</p>
              <p className="text-xs text-gray-400 mt-1">Bar chart and pie chart would go here</p>
            </div>
          </div>
          
          {/* Brand Legend */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Detailübersicht</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Metabo (94)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Bosch (38)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span>Makita (23)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span>DEWALT (17)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span>Hilti (26)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>FLEX (16)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                <span>HiKOKI (16)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                <span>Milwaukee (5)</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Markenverteilung vom 4.7.2025"
          subtitle="Produktanzahl pro Marke"
        >
          {/* Mock Chart Content */}
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Chart placeholder</p>
              <p className="text-xs text-gray-400 mt-1">Bar chart and pie chart would go here</p>
            </div>
          </div>
          
          {/* Brand Legend */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Detailübersicht</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Bosch (93)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Metabo (89)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span>milwaukee (68)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span>Makita (45)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                <span>DEWALT (39)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                <span>HiKOKI (38)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>FEIN (25)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>FLEX (24)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span>Hilti (17)</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </ModernLayout>
  );
};

export default ModernHomePage;
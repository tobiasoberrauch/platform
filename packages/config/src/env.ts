export interface AppFunction {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon?: string;
  url: string;
  color: string;
  gradient: string;
  functions?: AppFunction[];
}

export const getAppConfigs = (): AppConfig[] => {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev ? 'http://localhost' : process.env.NEXT_PUBLIC_BASE_URL || 'https://platform.yourcompany.com';
  
  return [
    {
      id: 'platform',
      name: 'CleverCompany',
      description: 'Your comprehensive digital workspace hub',
      icon: '🏠',
      url: isDev ? `${baseUrl}:3000` : `${baseUrl}`,
      color: 'bg-gray-500',
      gradient: 'from-gray-600 to-gray-800',
      functions: [
        {
          id: 'lagebericht',
          name: 'Lagebericht',
          description: 'Umfassender Unternehmensbericht',
          url: isDev ? `${baseUrl}:3000/lagebericht` : `${baseUrl}/lagebericht`,
          icon: '📋'
        }
      ]
    },
    {
      id: 'benchmark',
      name: 'CleverBenchmark',
      description: 'Advanced performance monitoring and analytics platform with real-time insights',
      icon: '📊',
      url: isDev ? `${baseUrl}:3001` : `${baseUrl}/benchmark`,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-700',
      functions: [
        {
          id: 'product-benchmark',
          name: 'Produkt Benchmark',
          description: 'Vergleichen Sie Ihre Produkte mit der Konkurrenz',
          url: isDev ? `${baseUrl}:3001/product-benchmark` : `${baseUrl}/benchmark/product-benchmark`,
          icon: '🏆'
        },
        {
          id: 'market-intelligence',
          name: 'Market Intelligence',
          description: 'Marktanalysen und Trends',
          url: isDev ? `${baseUrl}:3001/market-intelligence` : `${baseUrl}/benchmark/market-intelligence`,
          icon: '📈'
        },
        {
          id: 'competitive-intelligence',
          name: 'Competitive Intelligence',
          description: 'Wettbewerbsanalyse und Strategien',
          url: isDev ? `${baseUrl}:3001/competitive-intelligence` : `${baseUrl}/benchmark/competitive-intelligence`,
          icon: '🎯'
        }
      ]
    },
    {
      id: 'csrd',
      name: 'CleverCSRD',
      description: 'Comprehensive Corporate Sustainability Reporting Directive compliance solution',
      icon: '🌱',
      url: isDev ? `${baseUrl}:3002` : `${baseUrl}/csrd`,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-600',
      functions: [
        {
          id: 'wesentlichkeitsanalyse',
          name: 'Wesentlichkeitsanalyse',
          description: 'Identifizierung wesentlicher Nachhaltigkeitsthemen',
          url: isDev ? `${baseUrl}:3002/wesentlichkeitsanalyse` : `${baseUrl}/csrd/wesentlichkeitsanalyse`,
          icon: '🔍'
        },
        {
          id: 'csrd-reporting',
          name: 'CSRD',
          description: 'Corporate Sustainability Reporting Directive',
          url: isDev ? `${baseUrl}:3002/csrd-reporting` : `${baseUrl}/csrd/csrd-reporting`,
          icon: '📊'
        }
      ]
    },
    {
      id: 'support',
      name: 'CleverSupport',
      description: 'Intelligent customer support and ticketing system with AI assistance',
      icon: '🛠️',
      url: isDev ? `${baseUrl}:3003` : `${baseUrl}/support`,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-600',
      functions: [
        {
          id: 'zero-level-support',
          name: 'Zero Level Support',
          description: 'Automatisierte Erstbearbeitung von Support-Anfragen',
          url: isDev ? `${baseUrl}:3003/zero-level` : `${baseUrl}/support/zero-level`,
          icon: '🤖'
        }
      ]
    }
  ];
};

export const getCurrentAppId = (): string => {
  // Always return 'platform' during SSR to ensure consistency
  if (typeof window === 'undefined') {
    return 'platform';
  }
  
  // Client-side detection
  const port = window.location.port;
  const pathname = window.location.pathname;
  
  // Development: Detect by port
  if (port === '3000') return 'platform';
  if (port === '3001') return 'benchmark';
  if (port === '3002') return 'csrd';
  if (port === '3003') return 'support';
  
  // Production: Detect by path
  if (pathname.startsWith('/benchmark')) return 'benchmark';
  if (pathname.startsWith('/csrd')) return 'csrd';
  if (pathname.startsWith('/support')) return 'support';
  
  return 'platform'; // Default fallback
};

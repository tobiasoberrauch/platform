export interface AppFunction {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  // Permission system
  requiredRole?: 'admin' | 'user' | 'guest';
  requiredPermissions?: string[];
  availableForCompanies?: string[];
  availableForUsers?: string[];
  isEnabled?: boolean;
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
  // Permission system
  requiredRole?: 'admin' | 'user' | 'guest';
  requiredPermissions?: string[];
  availableForCompanies?: string[];
  availableForUsers?: string[];
  isEnabled?: boolean;
  isClickable?: boolean; // Whether the app itself is clickable in selector
}

// Port configuration system
const getPortConfig = () => {
  // Try multiple sources for the port range start
  let portRangeStart = 3000; // default fallback
  
  // Server-side: check process.env
  if (typeof process !== 'undefined' && process.env) {
    portRangeStart = parseInt(process.env.PORT_RANGE_START || process.env.NEXT_PUBLIC_PORT_RANGE_START || '3000');
  }
  
  // Client-side: check browser environment or window object
  if (typeof window !== 'undefined') {
    // Try to get from window.__PORT_RANGE_START__ if set
    portRangeStart = parseInt((window as any).__PORT_RANGE_START__ || process.env.NEXT_PUBLIC_PORT_RANGE_START || '3000');
  }
  
  return {
    platform: portRangeStart,
    benchmark: portRangeStart + 1,
    csrd: portRangeStart + 2,
    support: portRangeStart + 3
  };
};

const ports = getPortConfig();

export const getAppConfigs = (): AppConfig[] => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Production base URL configuration
  const productionBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                           process.env.BASE_URL || 
                           'https://platform.yourcompany.com';
  
  const baseUrl = isDev ? 'http://localhost' : productionBaseUrl;
  
  return [
    {
      id: 'platform',
      name: 'CleverCompany',
      description: 'Your comprehensive digital workspace hub',
      icon: '🏠',
      url: isDev ? `${baseUrl}:${ports.platform}` : `${baseUrl}`,
      color: 'bg-gray-500',
      gradient: 'from-gray-600 to-gray-800',
      isClickable: true,
      isEnabled: true,
      requiredRole: 'guest',
      functions: [
        {
          id: 'lagebericht',
          name: 'Lagebericht',
          description: 'Umfassender Unternehmensbericht',
          url: isDev ? `${baseUrl}:${ports.platform}/lagebericht` : `${baseUrl}/lagebericht`,
          icon: '📋',
          isEnabled: true,
          requiredRole: 'user'
        }
      ]
    },
    {
      id: 'benchmark',
      name: 'CleverBenchmark',
      description: 'Advanced performance monitoring and analytics platform with real-time insights',
      icon: '📊',
      url: isDev ? `${baseUrl}:${ports.benchmark}` : `${baseUrl}/benchmark`,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-700',
      isClickable: true,
      isEnabled: true,
      requiredRole: 'user',
      requiredPermissions: ['benchmark.access'],
      functions: [
        {
          id: 'product-benchmark',
          name: 'Produkt Benchmark',
          description: 'Vergleichen Sie Ihre Produkte mit der Konkurrenz',
          url: isDev ? `${baseUrl}:${ports.benchmark}/product-benchmark` : `${baseUrl}/benchmark/product-benchmark`,
          icon: '🏆',
          isEnabled: true,
          requiredRole: 'user',
          requiredPermissions: ['benchmark.products']
        },
        {
          id: 'market-intelligence',
          name: 'Market Intelligence',
          description: 'Marktanalysen und Trends',
          url: isDev ? `${baseUrl}:${ports.benchmark}/market-intelligence` : `${baseUrl}/benchmark/market-intelligence`,
          icon: '📈',
          isEnabled: true,
          requiredRole: 'user',
          requiredPermissions: ['benchmark.market']
        },
        {
          id: 'competitive-intelligence',
          name: 'Competitive Intelligence',
          description: 'Wettbewerbsanalyse und Strategien',
          url: isDev ? `${baseUrl}:${ports.benchmark}/competitive-intelligence` : `${baseUrl}/benchmark/competitive-intelligence`,
          icon: '🎯',
          isEnabled: true,
          requiredRole: 'admin',
          requiredPermissions: ['benchmark.competitive']
        }
      ]
    },
    {
      id: 'csrd',
      name: 'CleverCSRD',
      description: 'Comprehensive Corporate Sustainability Reporting Directive compliance solution',
      icon: '🌱',
      url: isDev ? `${baseUrl}:${ports.csrd}` : `${baseUrl}/csrd`,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-600',
      isClickable: true,
      isEnabled: true,
      requiredRole: 'user',
      requiredPermissions: ['csrd.access'],
      functions: [
        {
          id: 'wesentlichkeitsanalyse',
          name: 'Wesentlichkeitsanalyse',
          description: 'Identifizierung wesentlicher Nachhaltigkeitsthemen',
          url: isDev ? `${baseUrl}:${ports.csrd}/wesentlichkeitsanalyse` : `${baseUrl}/csrd/wesentlichkeitsanalyse`,
          icon: '🔍',
          isEnabled: true,
          requiredRole: 'user',
          requiredPermissions: ['csrd.analysis']
        },
        {
          id: 'csrd-reporting',
          name: 'CSRD',
          description: 'Corporate Sustainability Reporting Directive',
          url: isDev ? `${baseUrl}:${ports.csrd}/csrd-reporting` : `${baseUrl}/csrd/csrd-reporting`,
          icon: '📊',
          isEnabled: true,
          requiredRole: 'admin',
          requiredPermissions: ['csrd.reporting']
        }
      ]
    },
    {
      id: 'support',
      name: 'CleverSupport',
      description: 'Intelligent customer support and ticketing system with AI assistance',
      icon: '🛠️',
      url: isDev ? `${baseUrl}:${ports.support}` : `${baseUrl}/support`,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-600',
      isClickable: true,
      isEnabled: true,
      requiredRole: 'user',
      requiredPermissions: ['support.access'],
      functions: [
        {
          id: 'zero-level-support',
          name: 'Zero Level Support',
          description: 'Automatisierte Erstbearbeitung von Support-Anfragen',
          url: isDev ? `${baseUrl}:${ports.support}/zero-level` : `${baseUrl}/support/zero-level`,
          icon: '🤖',
          isEnabled: true,
          requiredRole: 'user',
          requiredPermissions: ['support.tickets']
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
  const port = parseInt(window.location.port);
  const pathname = window.location.pathname;
  
  // Development: Detect by port using dynamic port configuration
  if (port === ports.platform) return 'platform';
  if (port === ports.benchmark) return 'benchmark';
  if (port === ports.csrd) return 'csrd';
  if (port === ports.support) return 'support';
  
  // Production: Detect by path
  if (pathname.startsWith('/benchmark')) return 'benchmark';
  if (pathname.startsWith('/csrd')) return 'csrd';
  if (pathname.startsWith('/support')) return 'support';
  
  return 'platform'; // Default fallback
};

export interface Company {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  type: 'parent' | 'subsidiary';
  parentId?: string; // für Tochtergesellschaften
  settings: {
    theme?: string;
    features?: string[];
    permissions?: string[];
  };
}

export interface AppFunction {
  name: string;
  description: string;
  url: string;
  // Neue Eigenschaft für Firmen-spezifische Verfügbarkeit
  availableForCompanies?: string[]; // Company IDs
}

export const getCompanies = (): Company[] => {
  return [
    {
      id: 'konstruktiv',
      name: 'konstruktiv',
      displayName: 'konstruktiv GmbH',
      type: 'parent',
      settings: {
        theme: 'blue',
        features: ['all'],
        permissions: ['admin', 'user']
      }
    },
    {
      id: 'konstruktiv-subsidiary-1',
      name: 'subsidiary-1',
      displayName: 'Tochtergesellschaft 1',
      type: 'subsidiary',
      parentId: 'konstruktiv',
      settings: {
        theme: 'green',
        features: ['platform', 'csrd'],
        permissions: ['user']
      }
    },
    {
      id: 'konstruktiv-subsidiary-2',
      name: 'subsidiary-2',
      displayName: 'Tochtergesellschaft 2',
      type: 'subsidiary',
      parentId: 'konstruktiv',
      settings: {
        theme: 'purple',
        features: ['benchmark', 'support'],
        permissions: ['user']
      }
    }
  ];
};

// Neue Funktion für aktuelle Firma
export const getCurrentCompanyId = (): string => {
  if (typeof window === 'undefined') {
    return 'konstruktiv'; // Default für SSR
  }
  
  // Aus localStorage oder Session Storage laden
  return localStorage.getItem('selectedCompanyId') || 'konstruktiv';
};

export const setCurrentCompanyId = (companyId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedCompanyId', companyId);
  }
};

// User and Permission System
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  companyId: string;
  isActive: boolean;
}

// Get current user (mock implementation - replace with real auth)
export const getCurrentUser = (): User => {
  if (typeof window === 'undefined') {
    return {
      id: 'admin-user',
      name: 'Admin User',
      email: 'admin@clevercompany.ai',
      role: 'admin',
      permissions: ['*'], // Admin has all permissions
      companyId: 'konstruktiv',
      isActive: true
    };
  }
  
  // Try to get from localStorage (real implementation would use auth context)
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default admin user
  return {
    id: 'admin-user',
    name: 'Admin User',
    email: 'admin@clevercompany.ai',
    role: 'admin',
    permissions: ['*'],
    companyId: getCurrentCompanyId(),
    isActive: true
  };
};

// Check if user has permission
export const hasPermission = (user: User, permission: string): boolean => {
  if (!user.isActive) return false;
  if (user.role === 'admin' || user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
};

// Check if user has role
export const hasRole = (user: User, role: 'admin' | 'user' | 'guest'): boolean => {
  if (!user.isActive) return false;
  
  const roleHierarchy = { 'admin': 3, 'user': 2, 'guest': 1 };
  const userLevel = roleHierarchy[user.role];
  const requiredLevel = roleHierarchy[role];
  
  return userLevel >= requiredLevel;
};

// Filter apps based on user permissions
export const getFilteredAppConfigs = (user?: User): AppConfig[] => {
  const currentUser = user || getCurrentUser();
  const allApps = getAppConfigs();
  
  return allApps.filter(app => {
    // Check if app is enabled
    if (app.isEnabled === false) return false;
    
    // Check role requirement
    if (app.requiredRole && !hasRole(currentUser, app.requiredRole)) return false;
    
    // Check permissions
    if (app.requiredPermissions?.length) {
      const hasAllPermissions = app.requiredPermissions.every(permission => 
        hasPermission(currentUser, permission)
      );
      if (!hasAllPermissions) return false;
    }
    
    // Check company access
    if (app.availableForCompanies?.length) {
      if (!app.availableForCompanies.includes(currentUser.companyId)) return false;
    }
    
    // Check user access
    if (app.availableForUsers?.length) {
      if (!app.availableForUsers.includes(currentUser.id)) return false;
    }
    
    // Filter functions
    if (app.functions) {
      app.functions = app.functions.filter(func => {
        if (func.isEnabled === false) return false;
        if (func.requiredRole && !hasRole(currentUser, func.requiredRole)) return false;
        if (func.requiredPermissions?.length) {
          return func.requiredPermissions.every(permission => 
            hasPermission(currentUser, permission)
          );
        }
        return true;
      });
    }
    
    return true;
  });
};

// Admin permission management
export interface PermissionUpdate {
  type: 'app' | 'function';
  id: string;
  appId?: string; // For functions
  enabled: boolean;
  requiredRole?: 'admin' | 'user' | 'guest';
  requiredPermissions?: string[];
  availableForCompanies?: string[];
  availableForUsers?: string[];
}

export const updatePermissions = (updates: PermissionUpdate[]): void => {
  // In a real implementation, this would call an API
  const stored = localStorage.getItem('permissionOverrides') || '{}';
  const overrides = JSON.parse(stored);
  
  updates.forEach(update => {
    const key = update.type === 'app' ? update.id : `${update.appId}.${update.id}`;
    overrides[key] = {
      enabled: update.enabled,
      requiredRole: update.requiredRole,
      requiredPermissions: update.requiredPermissions,
      availableForCompanies: update.availableForCompanies,
      availableForUsers: update.availableForUsers
    };
  });
  
  localStorage.setItem('permissionOverrides', JSON.stringify(overrides));
};

// Get permission overrides
export const getPermissionOverrides = (): Record<string, any> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('permissionOverrides') || '{}';
  return JSON.parse(stored);
};

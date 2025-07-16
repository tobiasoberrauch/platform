import { CidaasUser } from './cidaas'

export interface AccessRule {
  id: string
  name: string
  description: string
  cidaasConditions: {
    // User attributes from cidaas
    email?: string | string[]
    groups?: string | string[]
    roles?: string | string[]
    customFields?: Record<string, any>
    emailDomain?: string | string[]
    subscription?: string | string[]
  }
  grantedAccess: {
    applications: string[]
    functions: string[]
    permissions: string[]
    role: 'admin' | 'user' | 'guest'
  }
  priority: number // Higher priority rules override lower ones
  isActive: boolean
}

export interface CidaasAccessMapping {
  rules: AccessRule[]
  defaultAccess: {
    applications: string[]
    functions: string[]
    permissions: string[]
    role: 'admin' | 'user' | 'guest'
  }
}

// Default access control configuration
export const defaultCidaasAccessConfig: CidaasAccessMapping = {
  rules: [
    {
      id: 'admin-rule',
      name: 'Admin Access',
      description: 'Full access for administrators',
      cidaasConditions: {
        email: ['tobias.oberrauch@audius.de', 'admin@clevercompany.ai'],
        roles: ['admin', 'super-admin']
      },
      grantedAccess: {
        applications: ['platform', 'benchmark', 'csrd', 'support'],
        functions: ['*'], // All functions
        permissions: ['*'], // All permissions
        role: 'admin'
      },
      priority: 100,
      isActive: true
    },
    {
      id: 'professional-subscription',
      name: 'Professional Subscription Access',
      description: 'Access based on professional subscription',
      cidaasConditions: {
        subscription: ['clevercsrd-professional-b1', 'professional', 'enterprise']
      },
      grantedAccess: {
        applications: ['platform', 'benchmark', 'csrd'],
        functions: ['lagebericht', 'product-benchmark', 'wesentlichkeitsanalyse', 'csrd-reporting'],
        permissions: ['benchmark.access', 'benchmark.products', 'csrd.access', 'csrd.analysis'],
        role: 'user'
      },
      priority: 80,
      isActive: true
    },
    {
      id: 'audius-domain',
      name: 'Audius Company Access',
      description: 'Access for audius.de domain users',
      cidaasConditions: {
        emailDomain: ['audius.de', 'clevercompany.ai']
      },
      grantedAccess: {
        applications: ['platform', 'support'],
        functions: ['lagebericht', 'zero-level-support'],
        permissions: ['support.access', 'support.tickets'],
        role: 'user'
      },
      priority: 60,
      isActive: true
    },
    {
      id: 'csrd-group',
      name: 'CSRD Group Access',
      description: 'Access for CSRD working group members',
      cidaasConditions: {
        groups: ['csrd-team', 'sustainability']
      },
      grantedAccess: {
        applications: ['platform', 'csrd'],
        functions: ['lagebericht', 'wesentlichkeitsanalyse', 'csrd-reporting'],
        permissions: ['csrd.access', 'csrd.analysis', 'csrd.reporting'],
        role: 'user'
      },
      priority: 70,
      isActive: true
    },
    {
      id: 'basic-subscription',
      name: 'Basic Subscription Access',
      description: 'Limited access for basic subscription',
      cidaasConditions: {
        subscription: ['basic', 'starter']
      },
      grantedAccess: {
        applications: ['platform'],
        functions: ['lagebericht'],
        permissions: [],
        role: 'user'
      },
      priority: 40,
      isActive: true
    }
  ],
  defaultAccess: {
    applications: ['platform'],
    functions: [],
    permissions: [],
    role: 'guest'
  }
}

/**
 * Evaluate cidaas user against access rules
 */
export function evaluateUserAccess(
  cidaasUser: CidaasUser,
  accessConfig: CidaasAccessMapping = defaultCidaasAccessConfig
): {
  applications: string[]
  functions: string[]
  permissions: string[]
  role: 'admin' | 'user' | 'guest'
  appliedRules: string[]
} {
  const appliedRules: string[] = []
  let combinedAccess = { ...accessConfig.defaultAccess }

  // Sort rules by priority (highest first)
  const activeRules = accessConfig.rules
    .filter(rule => rule.isActive)
    .sort((a, b) => b.priority - a.priority)

  for (const rule of activeRules) {
    if (matchesConditions(cidaasUser, rule.cidaasConditions)) {
      appliedRules.push(rule.id)
      
      // Merge access (higher priority rules can override)
      combinedAccess = mergeAccess(combinedAccess, rule.grantedAccess)
    }
  }

  return {
    ...combinedAccess,
    appliedRules
  }
}

/**
 * Check if cidaas user matches rule conditions
 */
function matchesConditions(
  user: CidaasUser,
  conditions: AccessRule['cidaasConditions']
): boolean {
  // Check email
  if (conditions.email) {
    const emails = Array.isArray(conditions.email) ? conditions.email : [conditions.email]
    if (user.email && !emails.includes(user.email)) {
      return false
    }
  }

  // Check email domain
  if (conditions.emailDomain && user.email) {
    const domains = Array.isArray(conditions.emailDomain) ? conditions.emailDomain : [conditions.emailDomain]
    const userDomain = user.email.split('@')[1]
    if (!domains.includes(userDomain)) {
      return false
    }
  }

  // Check groups
  if (conditions.groups && user.groups) {
    const requiredGroups = Array.isArray(conditions.groups) ? conditions.groups : [conditions.groups]
    const hasGroup = requiredGroups.some(group => user.groups?.includes(group))
    if (!hasGroup) {
      return false
    }
  }

  // Check roles
  if (conditions.roles && user.roles) {
    const requiredRoles = Array.isArray(conditions.roles) ? conditions.roles : [conditions.roles]
    const hasRole = requiredRoles.some(role => user.roles?.includes(role))
    if (!hasRole) {
      return false
    }
  }

  // Check subscription (custom field)
  if (conditions.subscription) {
    const subscriptions = Array.isArray(conditions.subscription) ? conditions.subscription : [conditions.subscription]
    const userSubscription = (user as any).subscription
    if (!userSubscription || !subscriptions.includes(userSubscription)) {
      return false
    }
  }

  // Check custom fields
  if (conditions.customFields) {
    for (const [field, value] of Object.entries(conditions.customFields)) {
      if ((user as any)[field] !== value) {
        return false
      }
    }
  }

  return true
}

/**
 * Merge access rights (combine arrays, use highest role)
 */
function mergeAccess(
  existing: AccessRule['grantedAccess'],
  newAccess: AccessRule['grantedAccess']
): AccessRule['grantedAccess'] {
  const roleHierarchy = { 'guest': 0, 'user': 1, 'admin': 2 }
  
  return {
    applications: [...new Set([...existing.applications, ...newAccess.applications])],
    functions: [...new Set([...existing.functions, ...newAccess.functions])],
    permissions: [...new Set([...existing.permissions, ...newAccess.permissions])],
    role: roleHierarchy[newAccess.role] > roleHierarchy[existing.role] 
      ? newAccess.role 
      : existing.role
  }
}

/**
 * Create user profile from cidaas user with computed access
 */
export function createUserFromCidaas(cidaasUser: CidaasUser, companyId: string = 'konstruktiv') {
  const access = evaluateUserAccess(cidaasUser)
  
  return {
    id: cidaasUser.sub,
    name: cidaasUser.given_name && cidaasUser.family_name 
      ? `${cidaasUser.given_name} ${cidaasUser.family_name}`
      : cidaasUser.email,
    email: cidaasUser.email,
    role: access.role,
    companyId,
    permissions: access.permissions,
    isActive: cidaasUser.user_status === 'VERIFIED' || cidaasUser.user_status === 'ACTIVE',
    cidaasData: {
      sub: cidaasUser.sub,
      groups: cidaasUser.groups || [],
      roles: cidaasUser.roles || [],
      subscription: (cidaasUser as any).subscription,
      appliedRules: access.appliedRules
    },
    accessibleApps: access.applications,
    accessibleFunctions: access.functions
  }
}
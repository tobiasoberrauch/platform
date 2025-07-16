# Cidaas User Management Integration

This document explains how to fetch and manage users from cidaas in your platform application.

## Overview

The system provides:
- ✅ **API Service** (`/packages/config/src/cidaas.ts`) - Core functions to fetch users from cidaas
- ✅ **API Route** (`/apps/platform/src/pages/api/cidaas/users.ts`) - Next.js API endpoint
- ✅ **React Hook** (`/apps/platform/src/hooks/useCidaasUsers.ts`) - Easy-to-use hook for components
- ✅ **UI Component** (`/apps/platform/src/components/UserManagement.tsx`) - Complete user management interface

## Prerequisites

### 1. Cidaas Scopes
Make sure your cidaas application has the following scopes configured:
- `cidaas:users_read` - Read user information
- `cidaas:users_search` - Search through users

These are already included in your auth configuration (`packages/config/src/auth.ts`):
```typescript
authorization: { 
  params: { 
    scope: 'openid email profile cidaas:register cidaas:users_read cidaas:users_search' 
  } 
}
```

### 2. Access Token Storage
The system automatically stores the cidaas access token in the NextAuth JWT token for API calls.

## Usage Examples

### 1. Using the React Hook

```typescript
import { useCidaasUsers } from '../hooks/useCidaasUsers'

function UsersList() {
  const { users, totalCount, loading, error, refetch } = useCidaasUsers({
    limit: 20,
    offset: 0,
    search: 'john',
    filter: {
      user_status: 'ACTIVE'
    }
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Users ({totalCount})</h2>
      {users.map(user => (
        <div key={user.sub}>
          <h3>{user.given_name} {user.family_name}</h3>
          <p>{user.email}</p>
          <span>Status: {user.user_status}</span>
        </div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

### 2. Using the API Route Directly

```javascript
// GET /api/cidaas/users
const response = await fetch('/api/cidaas/users?limit=50&search=john&user_status=ACTIVE')
const data = await response.json()

console.log(data.data) // Array of users
console.log(data.total_count) // Total count
```

### 3. Using the Service Function

```typescript
import { fetchCidaasUsers } from '@digital-platform/config'
import { getToken } from 'next-auth/jwt'

// In an API route or server-side function
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
const result = await fetchCidaasUsers(token.accessToken, {
  limit: 100,
  search: 'admin',
  filter: {
    user_status: 'ACTIVE'
  }
})

if (result.success) {
  console.log(result.data.data) // Users array
  console.log(result.data.total_count) // Total count
}
```

## API Parameters

### Search Parameters
- `limit` (number, default: 50) - Number of users to return
- `offset` (number, default: 0) - Offset for pagination
- `order_by` (string, default: 'created_time') - Field to order by
- `order` ('asc' | 'desc', default: 'desc') - Sort order
- `search` (string) - Search term for names and email
- `filter` (object) - Filter criteria:
  - `email` (string) - Filter by email
  - `given_name` (string) - Filter by first name
  - `family_name` (string) - Filter by last name
  - `user_status` ('ACTIVE' | 'INACTIVE' | 'PENDING') - Filter by status

### User Object Structure
```typescript
interface CidaasUser {
  sub: string                    // Unique user ID
  given_name?: string           // First name
  family_name?: string          // Last name
  email: string                 // Email address
  email_verified?: boolean      // Email verification status
  picture?: string              // Profile picture URL
  roles?: string[]              // User roles
  groups?: string[]             // User groups
  user_status?: string          // User status (ACTIVE, INACTIVE, PENDING)
  created_time?: string         // Creation timestamp
  updated_time?: string         // Last update timestamp
}
```

## User Management Component

The complete `UserManagement` component provides:
- ✅ **Search** - Search users by name or email
- ✅ **Filtering** - Filter by user status
- ✅ **Pagination** - Navigate through large user lists
- ✅ **Selection** - Select individual or multiple users
- ✅ **Bulk Actions** - Actions for selected users
- ✅ **User Details** - Display user information with avatars

### Adding to Your Application

1. **Add to Navbar** (already implemented in `ImprovedNavbar.tsx`):
```typescript
<button onClick={() => setShowUserManagement(true)}>
  User Management
</button>
```

2. **Add Modal** (add this to your navbar component):
```typescript
{showUserManagement && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <UserManagement onClose={() => setShowUserManagement(false)} />
  </div>
)}
```

## Error Handling

The system handles various error scenarios:
- **No Access Token** - User not authenticated
- **Invalid Token** - Token expired or invalid
- **API Errors** - Cidaas API errors
- **Network Errors** - Connection issues

## Testing

You can test the integration by:

1. **Authenticate** with cidaas
2. **Open User Management** from the admin menu
3. **Search and Filter** users
4. **Check Browser Console** for any API errors

## Troubleshooting

### Common Issues

1. **"Unauthorized - No access token"**
   - Make sure user is authenticated with cidaas
   - Check that access token is stored in NextAuth session

2. **"HTTP error! status: 403"**
   - Verify cidaas scopes are configured correctly
   - Check that your cidaas application has user management permissions

3. **"No users returned"**
   - Verify the API endpoint URL is correct
   - Check that users exist in your cidaas tenant

### Debug Steps

1. **Check Access Token**:
```typescript
import { getToken } from 'next-auth/jwt'

const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
console.log('Access Token:', token?.accessToken)
```

2. **Test API Directly**:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://audius-prod.cidaas.eu/users-srv/search?limit=10"
```

3. **Check Network Tab** in browser dev tools for API calls

## Next Steps

You can extend this system by:
- Adding user creation/editing functionality
- Implementing role/permission management
- Adding user activity tracking
- Integrating with your app permission system
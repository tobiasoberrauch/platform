# Cidaas OAuth Debug Guide

## Current Issue
NextAuth is redirecting to `/auth/signin?error=cidaas` instead of going to the cidaas OAuth provider, indicating a configuration problem.

## ✅ What's Working
- ✅ Environment variables are loaded correctly
- ✅ NextAuth provider is configured and appears in `/api/auth/providers`
- ✅ Custom signin page loads and shows "Sign in with Cidaas" button
- ✅ NextAuth API endpoints are responding

## ❌ What's Not Working
- ❌ OAuth flow doesn't start (redirects to error page instead of cidaas)
- ❌ Error "cidaas" suggests provider initialization failure

## 🔍 Potential Causes

### 1. Cidaas Application Configuration
In your cidaas admin panel, verify:
- **Client ID**: `1401d46e-ad31-4b36-98e3-9a740a14a64b` 
- **Client Secret**: `fe7f18a5-4497-4a02-ad20-23f9cc30bd3b`
- **Callback URLs**: Must include `http://localhost:3000/api/auth/callback/cidaas`
- **Allowed Origins**: Must include `http://localhost:3000`
- **Grant Types**: Must include "Authorization Code"

### 2. Environment Issues
Current config (from `/api/test-env`):
```json
{
  "NEXTAUTH_URL": "http://localhost:3000",
  "NEXTAUTH_SECRET": "***hidden***",
  "CIDAAS_CLIENT_ID": "***hidden***",
  "CIDAAS_CLIENT_SECRET": "***hidden***"
}
```

### 3. NextAuth Provider Configuration
Current config (`packages/config/src/auth.ts`):
```typescript
{
  id: 'cidaas',
  name: 'Cidaas',
  type: 'oauth',
  authorization: {
    url: 'https://audius-prod.cidaas.eu/authz-srv/authz',
    params: {
      scope: 'openid email profile',
      response_type: 'code',
    }
  },
  token: 'https://audius-prod.cidaas.eu/token-srv/token',
  userinfo: 'https://audius-prod.cidaas.eu/users-srv/userinfo',
  clientId: process.env.CIDAAS_CLIENT_ID,
  clientSecret: process.env.CIDAAS_CLIENT_SECRET,
  idToken: true,
}
```

## 🧪 Debug Steps

### Step 1: Verify Cidaas Application Settings
In your cidaas admin panel, check:
1. Navigate to your application settings
2. Verify the callback URL: `http://localhost:3000/api/auth/callback/cidaas`
3. Ensure "Authorization Code" grant type is enabled
4. Check if the client is active and not expired

### Step 2: Test OAuth URL Generation
Try accessing the authorization URL manually:
```
https://audius-prod.cidaas.eu/authz-srv/authz?client_id=1401d46e-ad31-4b36-98e3-9a740a14a64b&response_type=code&scope=openid%20email%20profile&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fcidaas
```

### Step 3: Check Server Logs
When you click "Sign in with Cidaas", check the terminal where the Next.js server is running for any error messages.

### Step 4: Try Alternative Configuration
If the current config doesn't work, try this simplified version:

```typescript
{
  id: 'cidaas',
  name: 'Cidaas',
  type: 'oauth',
  wellKnown: 'https://audius-prod.cidaas.eu/.well-known/openid-configuration',
  clientId: process.env.CIDAAS_CLIENT_ID,
  clientSecret: process.env.CIDAAS_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'openid email profile'
    }
  }
}
```

## 🚀 Next Steps

1. **Check Cidaas Admin Panel**: Verify callback URL and application settings
2. **Test OAuth URL**: Try the manual URL above in browser
3. **Check Server Logs**: Look for specific error messages
4. **Verify Credentials**: Ensure client ID/secret are correct and active

## 🆘 Common Solutions

### Solution 1: Update Callback URL
In cidaas admin, add this exact callback URL:
```
http://localhost:3000/api/auth/callback/cidaas
```

### Solution 2: Enable Required Grant Types
Ensure these are enabled in cidaas:
- Authorization Code
- Refresh Token (optional)

### Solution 3: Verify Client Status
Check that the cidaas application is:
- Active (not disabled)
- Not expired
- Has correct domain restrictions

The most likely issue is the callback URL not being registered in cidaas. Please check this first!
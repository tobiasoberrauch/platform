# Monolithic Deployment Guide (Turborepo Native)

This guide shows how to deploy the Digital Platform as a **single Next.js application** instead of using multiple processes with Nginx. This is often simpler for smaller deployments.

## Overview

Instead of running 4 separate Next.js apps on different ports, we'll restructure the platform to run as:
- **Single Next.js app** on one port (e.g., 3000)
- **All apps become routes**: `/`, `/benchmark`, `/csrd`, `/support`
- **No reverse proxy needed** - just deploy one Next.js app
- **Shared resources**: Single process, shared memory, shared dependencies

## Approach Comparison

| Aspect | Microservices (Nginx) | Monolithic (Turborepo) |
|--------|----------------------|------------------------|
| **Deployment** | 4 processes + Nginx | 1 Next.js process |
| **Scaling** | Scale apps independently | Scale entire platform |
| **Complexity** | High (multiple processes) | Low (single app) |
| **Memory Usage** | Higher (4 Node processes) | Lower (1 Node process) |
| **Development** | Current setup works | Requires restructuring |
| **Fault Tolerance** | App isolation | Single point of failure |
| **Build Time** | Parallel builds possible | Single build |
| **Best For** | Large scale, microservices | Small-medium deployments |

## Implementation Options

### Option 1: Next.js Rewrites (Recommended)

Keep current app structure but use Next.js rewrites to serve all apps from one domain.

#### 1. Create Main Platform App with Rewrites

Update the main platform's `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for deployment
  output: 'standalone',
  
  async rewrites() {
    return [
      // Benchmark app routes
      {
        source: '/benchmark/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001/benchmark/:path*'
          : '/api/benchmark/:path*'
      },
      // CSRD app routes  
      {
        source: '/csrd/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3002/csrd/:path*' 
          : '/api/csrd/:path*'
      },
      // Support app routes
      {
        source: '/support/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3003/support/:path*'
          : '/api/support/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
```

#### 2. Create API Routes for Each App

In the platform app, create API routes that render the other apps:

```bash
# Create API route structure
mkdir -p apps/platform/pages/api/benchmark
mkdir -p apps/platform/pages/api/csrd  
mkdir -p apps/platform/pages/api/support
```

#### 3. Production Deployment

```bash
# Build only the platform app (which includes rewrites)
cd apps/platform
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai npm run build

# Deploy single app
npm start
```

### Option 2: Merge Apps into Single Next.js App

Restructure all apps into a single Next.js application with different page routes.

#### 1. Create Unified App Structure

```bash
# New structure
apps/
  └── unified-platform/
      ├── pages/
      │   ├── index.tsx           # Main platform
      │   ├── benchmark/
      │   │   ├── index.tsx       # Benchmark home
      │   │   └── [...slug].tsx   # Benchmark routes
      │   ├── csrd/
      │   │   ├── index.tsx       # CSRD home  
      │   │   └── [...slug].tsx   # CSRD routes
      │   └── support/
      │       ├── index.tsx       # Support home
      │       └── [...slug].tsx   # Support routes
      ├── components/
      │   ├── benchmark/          # Benchmark components
      │   ├── csrd/              # CSRD components
      │   └── support/           # Support components
      └── lib/
          ├── benchmark/          # Benchmark logic
          ├── csrd/              # CSRD logic  
          └── support/           # Support logic
```

#### 2. Migration Steps

1. **Create unified app**:
```bash
cd apps
npx create-next-app@latest unified-platform --typescript --tailwind --app
```

2. **Move components**:
```bash
# Copy all components from individual apps
cp -r benchmark/src/components unified-platform/components/benchmark
cp -r csrd/src/components unified-platform/components/csrd
cp -r support/src/components unified-platform/components/support
```

3. **Create page routes**:
```typescript
// apps/unified-platform/pages/benchmark/index.tsx
import { BenchmarkDashboard } from '../../components/benchmark/Dashboard';

export default function BenchmarkPage() {
  return <BenchmarkDashboard />;
}
```

4. **Update imports and routing**:
```typescript
// Use Next.js routing instead of separate apps
import { useRouter } from 'next/router';

// Navigation between sections
const router = useRouter();
router.push('/benchmark');
router.push('/csrd');
```

## Simple Production Deployment (No Nginx)

### Prerequisites
- Node.js 18+
- PM2 (optional, for process management)
- Domain pointing to your server

### Deployment Steps

#### 1. Server Setup
```bash
# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

#### 2. Deploy Application
```bash
# Clone and build
git clone <your-repo> /var/www/platform
cd /var/www/platform

# Install dependencies  
npm install

# Build for production (using Option 1 approach)
cd apps/platform
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai npm run build

# Start with PM2
pm2 start npm --name "platform" -- start
pm2 save
pm2 startup
```

#### 3. Simple Nginx Config (Optional)
If you still want Nginx for SSL termination:

```nginx
server {
    listen 80;
    server_name app.clevercompany.ai;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.clevercompany.ai;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/app.clevercompany.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.clevercompany.ai/privkey.pem;
    
    # Simple proxy to single Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Platform-as-a-Service Deployment

For even simpler deployment, use platforms that understand Next.js natively:

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from platform app directory
cd apps/platform
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_BASE_URL https://app.clevercompany.ai
```

### Netlify
```bash
# Build command
npm run build

# Publish directory  
apps/platform/.next

# Environment variables
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai
```

### Railway
```yaml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/platform && npm run build"

[deploy]
startCommand = "cd apps/platform && npm start"

[env]
NEXT_PUBLIC_BASE_URL = "https://app.clevercompany.ai"
```

## Development Workflow

### Current (Microservices) Approach
```bash
# Start all apps separately
PORT_RANGE_START=3000 make dev

# Apps run on:
# Platform: localhost:3000
# Benchmark: localhost:3001  
# CSRD: localhost:3002
# Support: localhost:3003
```

### Monolithic Approach
```bash
# Start single unified app
cd apps/platform  # or apps/unified-platform
npm run dev

# All routes available on localhost:3000:
# Platform: localhost:3000
# Benchmark: localhost:3000/benchmark
# CSRD: localhost:3000/csrd  
# Support: localhost:3000/support
```

## Pros and Cons Summary

### Microservices (Current + Nginx)
**Pros:**
- True separation of concerns
- Independent deployments possible
- Can scale individual apps
- Team ownership per app
- Different tech stacks possible per app

**Cons:**
- More complex deployment
- Higher resource usage
- More moving parts
- Requires reverse proxy knowledge

### Monolithic (Turborepo Native)
**Pros:**
- Simpler deployment (one app)
- Lower resource usage
- Easier to reason about
- Better for small-medium teams
- Works with any Next.js hosting

**Cons:**
- Single point of failure
- Harder to scale individual features
- All code in one repository/build
- Team coordination required

## Recommendation

**For your use case (`https://app.clevercompany.ai`), I'd recommend:**

1. **Start with monolithic** (Option 1: Next.js rewrites) because:
   - Simpler to deploy and maintain
   - Lower infrastructure costs
   - Easier SSL/domain management
   - Perfect for MVP/early stage

2. **Consider microservices later** when you need:
   - Independent team ownership
   - Different scaling requirements per app
   - Separate deployment pipelines
   - Technology diversity

Would you like me to help implement the **monolithic approach** with Next.js rewrites? This would eliminate the need for Nginx reverse proxy entirely.
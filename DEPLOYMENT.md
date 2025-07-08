# Deployment Configuration

## Overview

This digital platform uses environment-aware URL configuration to work seamlessly in both development and production environments.

## Deployment Approaches

Choose the deployment approach that best fits your needs:

### 🔄 Microservices Approach (Current)
> **📋 [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Multiple Next.js apps with Nginx reverse proxy

- **Best for**: Large scale, team ownership per app, independent scaling
- **Setup**: 4 separate Node.js processes + Nginx reverse proxy
- **Complexity**: Higher (multiple processes, reverse proxy configuration)
- **Resources**: Higher memory usage (4 Node.js instances)

### 🏗️ Monolithic Approach (Simplified)
> **📋 [DEPLOYMENT_MONOLITHIC.md](./DEPLOYMENT_MONOLITHIC.md)** - Single Next.js app with route-based architecture  

- **Best for**: Small-medium deployments, simpler infrastructure, lower costs
- **Setup**: Single Next.js process with internal routing
- **Complexity**: Lower (one app, no reverse proxy needed)
- **Resources**: Lower memory usage (1 Node.js instance)

## Development Environment

In development, each application runs on a separate port:

- **Platform**: http://localhost:3000 (main hub) - configurable with `PORT_RANGE_START`
- **Benchmark**: http://localhost:3001 - automatically calculated from port range
- **CSRD**: http://localhost:3002 - automatically calculated from port range
- **Support**: http://localhost:3003 - automatically calculated from port range

## Production Environment

In production, all applications are served from a single domain with path-based routing:

- **Platform**: https://app.clevercompany.ai (main hub)
- **Benchmark**: https://app.clevercompany.ai/benchmark
- **CSRD**: https://app.clevercompany.ai/csrd
- **Support**: https://app.clevercompany.ai/support

## Configuration

### Environment Variables

Set the following environment variable for production:

```bash
# Production base URL
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai

# Development port range (optional, defaults to 3000)
PORT_RANGE_START=3000
```

### Next.js Configuration

For production deployment, you'll need to configure path rewrites in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/benchmark/:path*',
        destination: '/benchmark/:path*', // Served by benchmark app
      },
      {
        source: '/csrd/:path*', 
        destination: '/csrd/:path*', // Served by csrd app
      },
      {
        source: '/support/:path*',
        destination: '/support/:path*', // Served by support app
      },
    ];
  },
};

module.exports = nextConfig;
```

## Deployment Options

### Option 1: Monolithic Deployment
Deploy all apps as a single Next.js application with different routes.

### Option 2: Microservice Deployment  
Deploy each app separately and use a reverse proxy (nginx/Cloudflare) to route traffic:

```nginx
location /benchmark {
  proxy_pass http://benchmark-service:3001;
}

location /csrd {
  proxy_pass http://csrd-service:3002;
}

location /support {
  proxy_pass http://support-service:3003;
}

location / {
  proxy_pass http://platform-service:3000;
}
```

### Option 3: CDN/Edge Deployment
Use Vercel, Netlify, or similar platforms with edge functions for routing.

## Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Start all applications:
   ```bash
   npm run dev
   ```

3. Access the platform at http://localhost:3000

## Production Setup

1. Set environment variables in your deployment platform
2. Build all applications:
   ```bash
   npm run build
   ```
3. Deploy according to your chosen deployment option

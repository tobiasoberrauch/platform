# Deployment Configuration

## Overview

This digital platform uses environment-aware URL configuration to work seamlessly in both development and production environments.

## Development Environment

In development, each application runs on a separate port:

- **Platform**: http://localhost:3000 (main hub)
- **Benchmark**: http://localhost:3001
- **CSRD**: http://localhost:3002  
- **Support**: http://localhost:3003

## Production Environment

In production, all applications are served from a single domain with path-based routing:

- **Platform**: https://platform.yourcompany.com (main hub)
- **Benchmark**: https://platform.yourcompany.com/benchmark
- **CSRD**: https://platform.yourcompany.com/csrd
- **Support**: https://platform.yourcompany.com/support

## Configuration

### Environment Variables

Set the following environment variable for production:

```bash
NEXT_PUBLIC_BASE_URL=https://platform.yourcompany.com
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

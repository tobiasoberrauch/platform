# Adding a New Product to the Platform

This guide explains how to add a new product/application to the digital platform.

## Quick Start

```bash
# 1. Create your new product (example: "analytics")
mkdir -p apps/analytics
cd apps/analytics

# 2. Initialize the Next.js app
npx create-next-app@latest . --typescript --tailwind --app

# 3. Update the package.json name
# Change "name": "analytics" in package.json

# 4. Add to default ports in Makefile (optional)
# Edit Makefile line: DEFAULT_PORTS := platform:3000 benchmark:3001 csrd:3002 support:3003 analytics:3004

# 5. Test your new product
make dev-analytics
```

## Detailed Steps

### 1. Create Product Structure

Create a new directory under `apps/` with your product name:

```bash
apps/
├── platform/
├── benchmark/
├── csrd/
├── support/
└── your-new-product/   # Your new product here
```

### 2. Set Up Next.js Application

```bash
cd apps/your-new-product
npx create-next-app@latest . --typescript --tailwind --app --no-git
```

### 3. Configure Package.json

Update `apps/your-new-product/package.json`:

```json
{
  "name": "@platform/your-new-product",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3004",
    "build": "next build",
    "start": "next start -p 3004",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@platform/ui": "workspace:*",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

### 4. Create Product Configuration (Optional)

Create `apps/your-new-product/product.config`:

```bash
# Product Configuration
PORT=3004
NAME="Your Product Name"
DESCRIPTION="Brief description of your product"
ICON="📊"  # Emoji or icon identifier
COLOR="#3B82F6"  # Primary color for the product
```

### 5. Integrate with Platform UI

Update `apps/your-new-product/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your Product - Digital Platform",
  description: "Description of your product",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### 6. Add to Platform Navigation

The platform will automatically discover your new app. To add it to the navigation with custom icon and description:

1. Create a products configuration file at `apps/platform/config/products.ts`:

```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  port: number;
  path: string;
}

export const products: Product[] = [
  {
    id: 'platform',
    name: 'Platform',
    description: 'Main dashboard and overview',
    icon: '🏠',
    color: '#3B82F6',
    port: 3000,
    path: '/'
  },
  {
    id: 'your-new-product',
    name: 'Your Product',
    description: 'Brief description',
    icon: '📊',
    color: '#10B981',
    port: 3004,
    path: '/your-product'
  }
  // ... other products
];
```

### 7. Update Turbo Configuration

Add your new product to `turbo.json` if needed:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 8. Test Your Product

```bash
# Test individual product
make dev-your-new-product

# Test with all products
make dev

# Build for production
make build-your-new-product

# List all available products
make list-apps
```

## Product Features to Implement

### Required Features
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Integration with shared UI components
- [ ] Proper routing setup
- [ ] Error handling
- [ ] Loading states

### Recommended Features
- [ ] User authentication integration
- [ ] Admin panel access control
- [ ] Data fetching with proper caching
- [ ] SEO optimization
- [ ] Analytics integration

## Common Issues

### Port Conflicts
If you get a port conflict error, either:
1. Change the port in `package.json` dev script
2. Add your product to `DEFAULT_PORTS` in the Makefile

### Build Errors
Ensure all dependencies are installed:
```bash
cd apps/your-new-product
npm install
```

### UI Components Not Found
Make sure to build the UI package first:
```bash
make build-ui
```

## Best Practices

1. **Consistent Naming**: Use kebab-case for product names
2. **Shared Components**: Use `@platform/ui` components for consistency
3. **Configuration**: Keep product-specific config in `product.config`
4. **Testing**: Add tests for your product features
5. **Documentation**: Update this guide if you discover new steps

## Need Help?

- Check existing products in `apps/` for examples
- Run `make help` for available commands
- Review the platform documentation at `/docs`
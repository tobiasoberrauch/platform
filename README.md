# Digital Platform

A modern web platform built with Turborepo containing three digital products:

- **Platform** - Main entry point for product selection
- **Benchmark** - Performance benchmarking and analytics
- **CSRD** - Corporate Sustainability Reporting Directive compliance
- **Support** - Customer support and ticketing system

## Features

- 🏗️ **Turborepo monorepo** for efficient development
- ⚛️ **Next.js apps** with TypeScript
- 🎨 **Shared UI components** with modern design
- 🔗 **Cross-product navigation** via product selector
- 📱 **Responsive layouts** with Tailwind CSS styling
- 🎯 **Product-specific functionality** for each app

## Architecture

```
apps/
  ├── platform/     # Main entry point
  ├── benchmark/    # Performance metrics  
  ├── csrd/         # Sustainability reporting
  └── support/      # Customer support

packages/
  ├── ui/           # Shared React components
  └── config/       # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

#### Quick Install (Recommended)

```bash
# Automated installation
make install
```

#### Manual Installation

If you prefer manual installation or the automated script fails:

```bash
# Run the install script directly
./install.sh
```

#### Step-by-step Manual Installation

1. Install Turborepo globally:
   ```bash
   npm install -g turbo
   ```

2. Install dependencies for each package:
   ```bash
   # Root dependencies
   npm install turbo @turbo/gen eslint prettier typescript --save-dev

   # UI package
   cd packages/ui
   npm install react @types/react tsup typescript eslint --save-dev

   # Platform app
   cd ../../apps/platform
   npm install next react react-dom @types/node @types/react @types/react-dom typescript eslint eslint-config-next

   # Benchmark app
   cd ../benchmark
   npm install next react react-dom @types/node @types/react @types/react-dom typescript eslint eslint-config-next

   # CSRD app
   cd ../csrd
   npm install next react react-dom @types/node @types/react @types/react-dom typescript eslint eslint-config-next

   # Support app
   cd ../support
   npm install next react react-dom @types/node @types/react @types/react-dom typescript eslint eslint-config-next
   ```

### Development

#### Quick Start

```bash
# Start all applications
make dev
```

#### Configuration

**Port Range (Development):**
```bash
# Default ports: 3000-3003
make dev

# Custom port range: 4000-4003
PORT_RANGE_START=4000 make dev

# Custom port range: 8000-8003
PORT_RANGE_START=8000 make dev
```

**Production Base URL:**
```bash
# Default production URL: https://platform.yourcompany.com
make build

# Custom production URL
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai make build
```

#### Individual Apps

```bash
# Start individual applications
make dev-platform     # Platform only
make dev-benchmark    # Benchmark only
make dev-csrd         # CSRD only  
make dev-support      # Support only
```

#### Manual Development

1. **Build shared packages first:**
   ```bash
   cd packages/ui
   npm run build
   # Or use: make build-ui
   ```

2. **Start all applications:**
   ```bash
   # From root directory
   turbo dev
   ```

   Or start individual apps:
   ```bash
   # Platform (main entry)
   cd apps/platform && npm run dev

   # Benchmark
   cd apps/benchmark && npm run dev

   # CSRD
   cd apps/csrd && npm run dev

   # Support
   cd apps/support && npm run dev
   ```

### Usage

1. **Start with the Platform** (default: http://localhost:3000, configurable with PORT_RANGE_START)
   - Main entry point with product selector
   - Click on any product card to launch it
   - Use quick access buttons for navigation

2. **Navigate between products:**
   - Each product has a header with product selector
   - Click any product button to switch
   - Products open in new tabs for easy switching

3. **Product Features:**

   **📊 Benchmark (port 3001 by default, configurable)**
   - Performance monitoring dashboard
   - Real-time metrics and analytics
   - System benchmarking tools

   **🌱 CSRD (port 3002 by default, configurable)**
   - ESG metrics tracking
   - Sustainability reporting
   - Compliance monitoring

   **🛠️ Support (port 3003 by default, configurable)**
   - Customer support tickets
   - Team performance metrics
   - Ticket management system

## Available Commands

### Quick Reference

```bash
# Setup
make install       # Install all dependencies
make help          # Show all available commands
make status        # Show project status

# Development
make dev           # Start all apps in development mode
make dev-platform  # Start only platform app
make dev-benchmark # Start only benchmark app
make dev-csrd      # Start only CSRD app
make dev-support   # Start only support app

# Building
make build         # Build all apps for production
make build-ui      # Build only UI package
make build-platform # Build only platform app

# Quality & Maintenance
make lint          # Run linting on all packages
make format        # Format code with Prettier
make clean         # Clean build artifacts
make reset         # Complete reset and reinstall

# Production
make start         # Start all apps in production mode

# Information
make urls          # Show application URLs
make status        # Show project status
```

### Direct Scripts (Alternative)

```bash
# Development
turbo dev          # Start all apps in development mode
turbo build        # Build all apps for production
turbo lint         # Lint all packages
turbo clean        # Clean all build artifacts

# Individual app commands
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Technology Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS (utility classes)
- **Build System:** Turborepo
- **Package Manager:** npm
- **Linting:** ESLint
- **Formatting:** Prettier

## Project Structure

- **Monorepo:** Turborepo manages multiple apps and packages
- **Shared UI:** Common components in `packages/ui`
- **Type Safety:** Full TypeScript coverage
- **Modern Design:** Clean, responsive interfaces
- **Cross-navigation:** Seamless product switching

## Product Selector

Each product includes a header navigation that allows users to:
- See current product context
- Switch to any other product
- Return to main platform
- Quick access to all products

The platform serves as the main hub where users can discover and launch products with detailed descriptions and visual cards.

## Production Deployment

For detailed production deployment instructions including server setup, SSL configuration, process management, and monitoring, see:

**📋 [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Complete step-by-step production deployment guide for `https://app.clevercompany.ai`

Quick reference for production:
```bash
# Set production URL and build
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai make build

# The apps will be accessible at:
# - Platform: https://app.clevercompany.ai
# - Benchmark: https://app.clevercompany.ai/benchmark  
# - CSRD: https://app.clevercompany.ai/csrd
# - Support: https://app.clevercompany.ai/support
```

## Development Notes

- All apps share the same UI component library
- TypeScript configuration is shared via `packages/config`
- Each app runs on a different port for parallel development
- Product selector enables seamless navigation between apps
- Modern responsive design with consistent styling
- Port range is configurable with `PORT_RANGE_START` environment variable

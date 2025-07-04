# Digital Platform

A modern web platform built with Turborepo containing three digital products:

- **Platform** (Port 3000) - Main entry point for product selection
- **Benchmark** (Port 3001) - Performance benchmarking and analytics
- **CSRD** (Port 3002) - Corporate Sustainability Reporting Directive compliance
- **Support** (Port 3003) - Customer support and ticketing system

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
  ├── platform/     # Main entry point (localhost:3000)
  ├── benchmark/    # Performance metrics (localhost:3001)
  ├── csrd/         # Sustainability reporting (localhost:3002)
  └── support/      # Customer support (localhost:3003)

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

#### Individual Apps

```bash
# Start individual applications
make dev-platform     # Platform only (localhost:3000)
make dev-benchmark    # Benchmark only (localhost:3001)
make dev-csrd         # CSRD only (localhost:3002)
make dev-support      # Support only (localhost:3003)
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

1. **Start with the Platform** (http://localhost:3000)
   - Main entry point with product selector
   - Click on any product card to launch it
   - Use quick access buttons for navigation

2. **Navigate between products:**
   - Each product has a header with product selector
   - Click any product button to switch
   - Products open in new tabs for easy switching

3. **Product Features:**

   **📊 Benchmark (localhost:3001)**
   - Performance monitoring dashboard
   - Real-time metrics and analytics
   - System benchmarking tools

   **🌱 CSRD (localhost:3002)**
   - ESG metrics tracking
   - Sustainability reporting
   - Compliance monitoring

   **🛠️ Support (localhost:3003)**
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

## Development Notes

- All apps share the same UI component library
- TypeScript configuration is shared via `packages/config`
- Each app runs on a different port for parallel development
- Product selector enables seamless navigation between apps
- Modern responsive design with consistent styling

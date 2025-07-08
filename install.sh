#!/bin/bash

set -e  # Exit on any error

echo "🚀 Installing Digital Platform Dependencies"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version is $NODE_VERSION. Recommended version is 18+."
    fi
    
    print_success "Prerequisites check passed"
    echo "Node.js: $(node -v)"
    echo "npm: $(npm -v)"
    echo ""
}

# Install global dependencies
install_global_deps() {
    print_status "Installing global dependencies..."
    
    if ! command -v turbo &> /dev/null; then
        npm install -g turbo
        print_success "Turbo installed globally"
    else
        print_success "Turbo already installed: $(turbo --version)"
    fi
    echo ""
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    
    npm install --no-package-lock || {
        print_warning "Failed to install via package.json, installing manually..."
        npm install turbo @turbo/gen eslint prettier typescript --save-dev --no-package-lock
    }
    
    print_success "Root dependencies installed"
    echo ""
}

# Install UI package dependencies
install_ui_deps() {
    print_status "Installing UI package dependencies..."
    
    cd packages/ui
    npm install --no-package-lock || {
        print_warning "Failed to install via package.json, installing manually..."
        npm install react @types/react tsup typescript eslint --save-dev --no-package-lock
    }
    cd ../../
    
    print_success "UI package dependencies installed"
    echo ""
}

# Install app dependencies
install_app_deps() {
    local app_name=$1
    print_status "Installing $app_name app dependencies..."
    
    cd "apps/$app_name"
    npm install --no-package-lock || {
        print_warning "Failed to install via package.json, installing manually..."
        npm install next react react-dom @types/node @types/react @types/react-dom typescript eslint eslint-config-next --no-package-lock
    }
    cd ../../
    
    print_success "$app_name app dependencies installed"
    echo ""
}

# Build shared packages
build_shared_packages() {
    print_status "Building shared UI package..."
    
    cd packages/ui
    npm run build
    cd ../../
    
    print_success "Shared packages built"
    echo ""
}

# Create .gitignore if it doesn't exist
create_gitignore() {
    if [ ! -f .gitignore ]; then
        print_status "Creating .gitignore..."
        cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# ESLint cache
.eslintcache

# Turbo
.turbo

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF
        print_success ".gitignore created"
    else
        print_success ".gitignore already exists"
    fi
    echo ""
}

# Main installation function
main() {
    echo "Starting installation process..."
    echo ""
    
    check_prerequisites
    create_gitignore
    install_global_deps
    install_root_deps
    install_ui_deps
    
    # Install dependencies for each app
    install_app_deps "platform"
    install_app_deps "benchmark"
    install_app_deps "csrd"
    install_app_deps "support"
    
    build_shared_packages
    
    echo "🎉 Installation Complete!"
    echo "======================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Start development: ${GREEN}make dev${NC} or ${GREEN}turbo dev${NC}"
    echo "2. Build all apps: ${GREEN}make build${NC}"
    echo "3. View help: ${GREEN}make help${NC}"
    echo ""
    echo "🌐 Applications will be available at:"
    echo "   Platform:  http://localhost:\${PORT_RANGE_START:-3000}"
    echo "   Benchmark: http://localhost:\$((PORT_RANGE_START+1))"
    echo "   CSRD:      http://localhost:\$((PORT_RANGE_START+2))"
    echo "   Support:   http://localhost:\$((PORT_RANGE_START+3))"
    echo ""
    echo "📖 See README.md for detailed documentation"
}

# Handle script interruption
trap 'print_error "Installation interrupted"; exit 1' INT

# Run main function
main "$@"

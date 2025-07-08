#!/bin/bash

echo "🚀 Setting up Digital Platform Development Environment"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"
echo ""

# Install global dependencies
echo "📦 Installing global dependencies..."
npm install -g turbo

echo ""
echo "🏗️ Digital Platform setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install dependencies manually (see README.md for detailed instructions)"
echo "2. Build shared UI package: cd packages/ui && npm run build"
echo "3. Start development: turbo dev"
echo ""
echo "🌐 Applications will be available at:"
echo "   Platform:  http://localhost:\${PORT_RANGE_START:-3000}"
echo "   Benchmark: http://localhost:\$((PORT_RANGE_START+1))"
echo "   CSRD:      http://localhost:\$((PORT_RANGE_START+2))"
echo "   Support:   http://localhost:\$((PORT_RANGE_START+3))"
echo ""
echo "📖 See README.md for detailed setup and usage instructions"

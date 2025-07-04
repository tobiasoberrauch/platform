# Quick Start Guide

Get up and running with the Digital Platform in minutes!

## 🚀 One-Command Setup

```bash
make install
```

That's it! This will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Install all dependencies
- ✅ Build shared packages
- ✅ Create .gitignore
- ✅ Set up the complete development environment

## 🏃‍♂️ Start Development

```bash
make dev
```

This starts all 4 applications:
- 🏠 **Platform**: http://localhost:3000 (start here!)
- 📊 **Benchmark**: http://localhost:3001
- 🌱 **CSRD**: http://localhost:3002
- 🛠️ **Support**: http://localhost:3003

## 🎯 First Steps

1. **Open Platform** → http://localhost:3000
2. **Explore Products** → Click on any product card
3. **Navigate** → Use the product selector in the header
4. **Switch Apps** → Each app has cross-navigation buttons

## 📋 Essential Commands

```bash
make help          # See all available commands
make status        # Check project status
make urls          # Show all app URLs
make clean         # Clean build artifacts
make reset         # Complete reset if needed
```

## 🔧 Individual App Development

```bash
make dev-platform   # Platform only
make dev-benchmark  # Benchmark only
make dev-csrd       # CSRD only
make dev-support    # Support only
```

## 🏗️ Building for Production

```bash
make build         # Build all apps
make start         # Start production servers
```

## ❓ Need Help?

- Run `make help` for all commands
- Check `README.md` for detailed documentation
- Run `make status` to diagnose issues

## 🎉 You're Ready!

The platform is designed for seamless navigation between products. Start at the Platform (localhost:3000) and explore each digital product through the beautiful interface.

Happy coding! 🚀

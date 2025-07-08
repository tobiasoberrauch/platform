# Digital Platform Makefile
# ========================

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Variables
TURBO := npx turbo
NPM := npm

# Configurable IP range settings
PORT_RANGE_START ?= 3000
PORT_RANGE_SIZE ?= 4

# Auto-discover all apps
APPS := $(notdir $(wildcard apps/*))

# Product configuration (can be overridden per product)
define get_port
$(shell if [ -f apps/$(1)/product.config ]; then grep -E '^PORT=' apps/$(1)/product.config | cut -d'=' -f2; else echo $(2); fi)
endef

# Default ports (calculated from configurable range)
DEFAULT_PORTS := platform:$(PORT_RANGE_START) benchmark:$(shell echo $$(($(PORT_RANGE_START) + 1))) csrd:$(shell echo $$(($(PORT_RANGE_START) + 2))) support:$(shell echo $$(($(PORT_RANGE_START) + 3)))

## Help
.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Digital Platform - Available Commands$(NC)"
	@echo "===================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Pattern Commands:$(NC)"
	@echo "  make dev-<app>     # Start specific app (e.g., dev-platform)"
	@echo "  make build-<app>   # Build specific app (e.g., build-csrd)"
	@echo "  make start-<app>   # Start specific app in production"
	@echo ""
	@echo "$(YELLOW)Quick Start:$(NC)"
	@echo "  1. make install    # Install all dependencies"
	@echo "  2. make list-apps  # See all available apps"
	@echo "  3. make dev        # Start all apps, or dev-<app> for specific"
	@echo ""
	@echo "$(YELLOW)Configuration:$(NC)"
	@echo "  PORT_RANGE_START=4000 make dev     # Use custom port range (default: 3000)"
	@echo "  NEXT_PUBLIC_BASE_URL=https://your-domain.com make build  # Set production base URL"

## Installation & Setup
.PHONY: install
install: ## Install all dependencies and build shared packages
	@echo "$(BLUE)🚀 Installing Digital Platform...$(NC)"
	@./install.sh

.PHONY: install-global
install-global: ## Install global dependencies only
	@echo "$(BLUE)📦 Installing global dependencies...$(NC)"
	@npm install -g turbo
	@echo "$(GREEN)✅ Global dependencies installed$(NC)"

.PHONY: clean-install
clean-install: clean install ## Clean everything and reinstall
	@echo "$(GREEN)✅ Clean installation completed$(NC)"

## Development
.PHONY: dev
dev: ## Start all applications in development mode
	@echo "$(BLUE)🚀 Starting development servers...$(NC)"
	@echo "$(YELLOW)Applications will be available at:$(NC)"
	@for app in $(APPS); do \
		port=$$(echo "$(DEFAULT_PORTS)" | grep -o "$$app:[0-9]*" | cut -d':' -f2); \
		if [ -n "$$port" ]; then \
			echo "  $$app: http://localhost:$$port"; \
		fi; \
	done
	@echo ""
	@TURBO_FORCE=true PORT_RANGE_START=$(PORT_RANGE_START) NEXT_PUBLIC_PORT_RANGE_START=$(PORT_RANGE_START) PORT_platform=$(PORT_RANGE_START) PORT_benchmark=$(shell echo $$(($(PORT_RANGE_START) + 1))) PORT_csrd=$(shell echo $$(($(PORT_RANGE_START) + 2))) PORT_support=$(shell echo $$(($(PORT_RANGE_START) + 3))) $(TURBO) dev

# Pattern rule for dev-<product>
.PHONY: dev-%
dev-%: ## Start specific app in development mode
	@if [ -d "apps/$*" ]; then \
		echo "$(BLUE)🚀 Starting $* app...$(NC)"; \
		cd apps/$* && $(NPM) run dev; \
	else \
		echo "$(RED)❌ App '$*' not found in apps/$(NC)"; \
		exit 1; \
	fi

## Building
.PHONY: build
build: ## Build all applications for production
	@echo "$(BLUE)🏗️ Building all applications...$(NC)"
	@$(TURBO) build
	@echo "$(GREEN)✅ All applications built successfully$(NC)"

.PHONY: build-ui
build-ui: ## Build only the shared UI package
	@echo "$(BLUE)🎨 Building UI package...$(NC)"
	@cd packages/ui && $(NPM) run build
	@echo "$(GREEN)✅ UI package built successfully$(NC)"

# Pattern rule for build-<product>
.PHONY: build-%
build-%: ## Build specific app for production
	@if [ -d "apps/$*" ]; then \
		echo "$(BLUE)🏗️ Building $* app...$(NC)"; \
		cd apps/$* && $(NPM) run build; \
	else \
		echo "$(RED)❌ App '$*' not found in apps/$(NC)"; \
		exit 1; \
	fi

## Testing & Quality
.PHONY: lint
lint: ## Run linting on all packages
	@echo "$(BLUE)🔍 Running linter...$(NC)"
	@$(TURBO) lint

.PHONY: lint-fix
lint-fix: ## Run linter with auto-fix
	@echo "$(BLUE)🔧 Running linter with auto-fix...$(NC)"
	@$(TURBO) lint -- --fix

.PHONY: format
format: ## Format code with Prettier
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	@$(NPM) run format

.PHONY: type-check
type-check: ## Run TypeScript type checking
	@echo "$(BLUE)🔍 Running type check...$(NC)"
	@$(TURBO) run type-check

## Maintenance
.PHONY: clean
clean: ## Clean all build artifacts and node_modules
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(NC)"
	@$(TURBO) clean
	@echo "$(BLUE)🧹 Removing node_modules...$(NC)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@find . -name ".next" -type d -prune -exec rm -rf {} +
	@find . -name "dist" -type d -prune -exec rm -rf {} +
	@find . -name ".turbo" -type d -prune -exec rm -rf {} +
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

.PHONY: clean-cache
clean-cache: ## Clean npm and turbo cache
	@echo "$(BLUE)🧹 Cleaning caches...$(NC)"
	@npm cache clean --force
	@$(TURBO) daemon clean
	@echo "$(GREEN)✅ Cache cleaned$(NC)"

.PHONY: reset
reset: clean clean-cache install ## Complete reset: clean everything and reinstall
	@echo "$(GREEN)✅ Complete reset completed$(NC)"

## Production
.PHONY: start
start: ## Start all applications in production mode
	@echo "$(BLUE)🚀 Starting production servers...$(NC)"
	@echo "$(YELLOW)Note: Make sure to run 'make build' first$(NC)"
	@$(TURBO) start

# Pattern rule for start-<product>
.PHONY: start-%
start-%: ## Start specific app in production mode
	@if [ -d "apps/$*" ]; then \
		echo "$(BLUE)🚀 Starting $* in production mode...$(NC)"; \
		cd apps/$* && $(NPM) run start; \
	else \
		echo "$(RED)❌ App '$*' not found in apps/$(NC)"; \
		exit 1; \
	fi

## App Management
.PHONY: list-apps
list-apps: ## List all available applications
	@echo "$(BLUE)Available Applications:$(NC)"
	@echo "====================="
	@for app in $(APPS); do \
		echo "  • $$app"; \
	done
	@echo ""
	@echo "$(YELLOW)Usage examples:$(NC)"
	@echo "  make dev-$$app     # Start $$app in development mode"
	@echo "  make build-$$app   # Build $$app for production"
	@echo "  make start-$$app   # Start $$app in production mode"

.PHONY: new-app
new-app: ## Create a new app (Usage: make new-app NAME=myapp)
	@if [ -z "$(NAME)" ]; then \
		echo "$(RED)❌ Please specify app name: make new-app NAME=myapp$(NC)"; \
		exit 1; \
	fi
	@if [ -d "apps/$(NAME)" ]; then \
		echo "$(RED)❌ App '$(NAME)' already exists$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🚀 Creating new app: $(NAME)...$(NC)"
	@echo "$(YELLOW)This would typically copy a template app structure$(NC)"
	@echo "$(YELLOW)For now, please create apps/$(NAME) manually$(NC)"

## Information
.PHONY: status
status: ## Show project status and information
	@echo "$(BLUE)Digital Platform Status$(NC)"
	@echo "======================"
	@echo ""
	@echo "$(YELLOW)Node.js:$(NC) $(shell node -v 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)npm:$(NC) $(shell npm -v 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)Turbo:$(NC) $(shell turbo --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "$(YELLOW)Available Applications:$(NC)"
	@for app in $(APPS); do \
		port=$$(echo "$(DEFAULT_PORTS)" | grep -o "$$app:[0-9]*" | cut -d':' -f2); \
		if [ -n "$$port" ]; then \
			echo "  📱 $$app (localhost:$$port)"; \
		else \
			echo "  📱 $$app"; \
		fi; \
	done
	@echo ""
	@echo "$(YELLOW)Packages:$(NC)"
	@for pkg in $(notdir $(wildcard packages/*)); do \
		echo "  📦 $$pkg"; \
	done
	@echo ""
	@if [ -d "node_modules" ]; then \
		echo "$(GREEN)✅ Dependencies installed$(NC)"; \
	else \
		echo "$(RED)❌ Dependencies not installed - run 'make install'$(NC)"; \
	fi

.PHONY: urls
urls: ## Show application URLs
	@echo "$(BLUE)Application URLs$(NC)"
	@echo "==============="
	@for app in $(APPS); do \
		port=$$(echo "$(DEFAULT_PORTS)" | grep -o "$$app:[0-9]*" | cut -d':' -f2); \
		if [ -n "$$port" ]; then \
			echo "$$app: http://localhost:$$port"; \
		else \
			echo "$$app: (no default port configured)"; \
		fi; \
	done

## Debugging
.PHONY: logs
logs: ## Show development logs
	@echo "$(BLUE)📋 Showing development logs...$(NC)"
	@$(TURBO) dev --log-order=grouped

.PHONY: check-deps
check-deps: ## Check for dependency issues
	@echo "$(BLUE)🔍 Checking dependencies...$(NC)"
	@$(NPM) ls --depth=0 || true
	@echo ""
	@echo "$(YELLOW)Checking each app:$(NC)"
	@for app in $(APPS); do \
		if [ -d "apps/$$app" ]; then \
			echo "Checking apps/$$app:"; \
			cd "apps/$$app" && $(NPM) ls --depth=0 || true; \
			cd ../..; \
		fi; \
	done

## Git helpers (if using git)
.PHONY: git-setup
git-setup: ## Initialize git repository with proper gitignore
	@if [ ! -d ".git" ]; then \
		echo "$(BLUE)📝 Initializing git repository...$(NC)"; \
		git init; \
		git add .; \
		git commit -m "Initial commit: Digital Platform setup"; \
		echo "$(GREEN)✅ Git repository initialized$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Git repository already exists$(NC)"; \
	fi

# Ensure scripts are executable
install.sh:
	@chmod +x install.sh

dev-setup.sh:
	@chmod +x dev-setup.sh

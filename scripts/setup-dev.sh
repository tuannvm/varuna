#!/bin/bash

# Development environment setup script
# This script sets up the development environment for Varuna

set -e

echo "🛠️  Setting up Varuna development environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    log_info "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_warn "Git is not installed. Some features may not work."
    fi
    
    log_info "Prerequisites check complete ✅"
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."
    
    npm install
    
    log_info "Dependencies installed ✅"
}

# Setup git hooks (optional)
setup_git_hooks() {
    if [ -d ".git" ]; then
        log_step "Setting up git hooks..."
        
        # Pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        log_info "Git hooks setup complete ✅"
    else
        log_warn "Not a git repository. Skipping git hooks setup."
    fi
}

# Create development environment file
create_env_file() {
    log_step "Creating development environment file..."
    
    if [ ! -f ".env.development" ]; then
        cat > .env.development << 'EOF'
# Development environment configuration
NODE_ENV=development

# Logging
LOG_LEVEL=debug

# Redis (optional - will use memory queue if not configured)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# Monitoring
METRICS_PORT=3001
EOF
        
        log_info "Created .env.development file"
    else
        log_info ".env.development already exists"
    fi
}

# Setup VS Code configuration
setup_vscode() {
    if [ -d ".vscode" ] || command -v code &> /dev/null; then
        log_step "Setting up VS Code configuration..."
        
        mkdir -p .vscode
        
        # VS Code settings
        cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
EOF
        
        # VS Code launch configuration
        cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Varuna",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "args": ["start"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
EOF
        
        # Recommended extensions
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss"
  ]
}
EOF
        
        log_info "VS Code configuration setup complete ✅"
    fi
}

# Run initial build and test
initial_build() {
    log_step "Running initial build and test..."
    
    npm run build
    npm test
    
    log_info "Initial build and test complete ✅"
}

# Print setup summary
print_summary() {
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Start development server: npm run dev:start"
    echo "  2. Run tests: npm test"
    echo "  3. Run tests in watch mode: npm run test:watch"
    echo "  4. Check system status: npm run dev:status"
    echo ""
    echo "Useful commands:"
    echo "  npm run build          - Build the project"
    echo "  npm run lint           - Run ESLint"
    echo "  npm run test:coverage  - Run tests with coverage"
    echo "  npm run test:phase0    - Run integration tests"
    echo ""
    echo "Happy coding! 🚀"
}

# Main setup process
check_prerequisites
install_dependencies
setup_git_hooks
create_env_file
setup_vscode
initial_build
print_summary
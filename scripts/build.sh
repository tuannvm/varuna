#!/bin/bash

# Build script for Varuna monitoring system
# This script handles the complete build process including:
# - Dependency installation
# - TypeScript compilation  
# - Testing
# - Production optimization

set -e

echo "🚀 Building Varuna monitoring system..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    log_error "Node.js version $NODE_VERSION is not supported. Please upgrade to v$REQUIRED_VERSION or higher."
    exit 1
fi

log_info "Node.js version: $NODE_VERSION ✅"

# Install dependencies
log_info "Installing dependencies..."
npm ci

# Clean previous build
log_info "Cleaning previous build..."
npm run clean

# Run linting
log_info "Running ESLint..."
if npm run lint; then
    log_info "Linting passed ✅"
else
    log_warn "Linting failed, but continuing build..."
fi

# Run tests
log_info "Running tests..."
npm test

# Build TypeScript
log_info "Compiling TypeScript..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    log_error "Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    log_error "Build failed - main entry point not found"
    exit 1
fi

log_info "Build completed successfully! 🎉"
log_info "Output directory: ./dist"
log_info "Main entry point: ./dist/index.js"

# Optional: Create build info
cat > dist/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$NODE_VERSION",
  "platform": "$(uname -s)",
  "arch": "$(uname -m)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "version": "$(node -p "require('./package.json').version")"
}
EOF

log_info "Build info saved to dist/build-info.json"
echo "✅ Build complete!"
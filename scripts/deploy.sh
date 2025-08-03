#!/bin/bash

# Deployment script for Varuna monitoring system
# Supports multiple deployment targets: local, docker, cloudflare

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_TARGET="${1:-local}"

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

show_usage() {
    echo "Usage: $0 [target]"
    echo ""
    echo "Deployment targets:"
    echo "  local      - Deploy to local environment (default)"
    echo "  docker     - Build and deploy Docker container"
    echo "  cloudflare - Deploy to Cloudflare Workers"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 docker"
    echo "  $0 cloudflare"
}

deploy_local() {
    log_step "Deploying to local environment..."
    
    # Build the project
    log_info "Building project..."
    bash "$SCRIPT_DIR/build.sh"
    
    # Create systemd service file (optional)
    if command -v systemctl &> /dev/null; then
        log_info "Creating systemd service file..."
        cat > /tmp/varuna.service << EOF
[Unit]
Description=Varuna Cloud Monitoring System
After=network.target

[Service]
Type=simple
User=\$USER
WorkingDirectory=$PROJECT_ROOT
ExecStart=/usr/bin/node $PROJECT_ROOT/dist/index.js start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        
        log_info "Systemd service file created at /tmp/varuna.service"
        log_info "To install: sudo cp /tmp/varuna.service /etc/systemd/system/ && sudo systemctl enable varuna"
    fi
    
    log_info "Local deployment complete!"
    log_info "Start the system with: npm run start"
}

deploy_docker() {
    log_step "Deploying to Docker..."
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/Dockerfile" ]; then
        log_info "Creating Dockerfile..."
        cat > "$PROJECT_ROOT/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY docs/ ./docs/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S varuna -u 1001

# Create logs directory
RUN mkdir -p /app/logs && chown varuna:nodejs /app/logs

USER varuna

EXPOSE 3000

CMD ["node", "dist/index.js", "start"]
EOF
    fi
    
    # Build Docker image
    log_info "Building Docker image..."
    bash "$SCRIPT_DIR/build.sh"
    docker build -t varuna:latest "$PROJECT_ROOT"
    
    # Create docker-compose.yml
    if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        log_info "Creating docker-compose.yml..."
        cat > "$PROJECT_ROOT/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  varuna:
    image: varuna:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    ports:
      - "3000:3000"
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  redis_data:
EOF
    fi
    
    log_info "Docker deployment complete!"
    log_info "Start with: docker-compose up -d"
}

deploy_cloudflare() {
    log_step "Deploying to Cloudflare Workers..."
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Install with: npm install -g wrangler"
        exit 1
    fi
    
    # Create wrangler.toml if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/wrangler.toml" ]; then
        log_info "Creating wrangler.toml..."
        cat > "$PROJECT_ROOT/wrangler.toml" << EOF
name = "varuna-monitor"
main = "dist/index.js"
compatibility_date = "2023-05-18"

[env.production]
name = "varuna-monitor-prod"

[[env.production.kv_namespaces]]
binding = "VARUNA_STORE"
id = "your-kv-namespace-id"

[env.production.vars]
NODE_ENV = "production"
EOF
        
        log_warn "Please update wrangler.toml with your Cloudflare account details"
    fi
    
    # Build for Cloudflare Workers
    log_info "Building for Cloudflare Workers..."
    bash "$SCRIPT_DIR/build.sh"
    
    # Deploy to Cloudflare
    log_info "Deploying to Cloudflare..."
    wrangler deploy
    
    log_info "Cloudflare deployment complete!"
}

# Main deployment logic
case "$DEPLOY_TARGET" in
    "local")
        deploy_local
        ;;
    "docker")
        deploy_docker
        ;;
    "cloudflare")
        deploy_cloudflare
        ;;
    "-h"|"--help")
        show_usage
        exit 0
        ;;
    *)
        log_error "Unknown deployment target: $DEPLOY_TARGET"
        show_usage
        exit 1
        ;;
esac

echo "🎉 Deployment to $DEPLOY_TARGET completed successfully!"
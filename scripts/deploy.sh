#!/bin/bash
# Server-side deployment script for xkyy
# This script is executed on the remote server after files are uploaded

set -e

# Configuration
DEPLOY_PATH="/home/admin/xkyy"
DIST_PATH="${DEPLOY_PATH}/dist"
BACKUP_PATH="${DEPLOY_PATH}/dist.backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verify dist directory exists (uploaded by rsync)
if [ ! -d "$DIST_PATH" ]; then
    log_error "Dist directory not found after upload!"
    exit 1
fi

log_info "Dist directory found, setting permissions..."

# Set correct permissions
log_info "Setting file permissions..."
# Ensure home directory is accessible by nginx
chmod o+x /home/admin
find "$DIST_PATH" -type d -exec chmod 755 {} \;
find "$DIST_PATH" -type f -exec chmod 644 {} \;

# Cleanup old backups (keep last 3)
log_info "Cleaning up old backups..."
ls -t "${BACKUP_PATH}_"* 2>/dev/null | tail -n +4 | xargs -r rm -rf

log_info "Deployment completed successfully!"
log_info "Nginx will serve the new static files automatically (no restart needed)"

#!/bin/bash

# Vercel Deployment Monitor Shell Script
# Simple deployment watcher with auto-troubleshooting

PROJECT_NAME="rishi-next"
CHECK_INTERVAL=30
MAX_RETRIES=3
RETRY_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vercel Deployment Monitor${NC}"
echo "Project: $PROJECT_NAME"
echo "Check interval: ${CHECK_INTERVAL}s"
echo "----------------------------------------"

# Function to get latest deployment
get_latest_deployment() {
    vercel ls $PROJECT_NAME --json 2>/dev/null | jq -r '.[0]'
}

# Function to check deployment status
check_deployment() {
    local deployment=$1
    local state=$(echo $deployment | jq -r '.state')
    local uid=$(echo $deployment | jq -r '.uid')
    local url=$(echo $deployment | jq -r '.url')
    
    echo -e "\n${BLUE}📦 Deployment: ${uid:0:8}...${NC}"
    echo "URL: $url"
    echo -n "Status: "
    
    case $state in
        "READY")
            echo -e "${GREEN}✅ READY${NC}"
            RETRY_COUNT=0
            ;;
        "ERROR"|"FAILED")
            echo -e "${RED}❌ $state${NC}"
            analyze_failure $uid
            ;;
        "BUILDING"|"INITIALIZING")
            echo -e "${YELLOW}⏳ $state${NC}"
            ;;
        *)
            echo "$state"
            ;;
    esac
}

# Function to analyze deployment failure
analyze_failure() {
    local deployment_id=$1
    
    echo -e "\n${YELLOW}🔍 Analyzing deployment logs...${NC}"
    
    # Get deployment logs
    local logs=$(vercel logs $deployment_id 2>/dev/null)
    
    # Check for common errors
    if echo "$logs" | grep -q "Module not found"; then
        echo -e "${RED}❌ Missing dependency detected${NC}"
        fix_missing_dependency "$logs"
        
    elif echo "$logs" | grep -q "Type error"; then
        echo -e "${RED}❌ TypeScript error detected${NC}"
        fix_typescript_error
        
    elif echo "$logs" | grep -q "environment variable"; then
        echo -e "${RED}❌ Missing environment variable${NC}"
        check_env_variables
        
    elif echo "$logs" | grep -q "heap out of memory"; then
        echo -e "${RED}❌ Memory error detected${NC}"
        fix_memory_error
        
    elif echo "$logs" | grep -q "database.*migration"; then
        echo -e "${RED}❌ Database migration issue${NC}"
        fix_database_migration
        
    else
        echo -e "${YELLOW}⚠️ Unknown error - manual intervention required${NC}"
        echo "$logs" | tail -20
    fi
    
    # Retry deployment if under max retries
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -e "\n${BLUE}🔄 Retrying deployment (attempt $RETRY_COUNT/$MAX_RETRIES)...${NC}"
        trigger_deployment
    else
        echo -e "\n${RED}❌ Max retries reached. Manual intervention required.${NC}"
    fi
}

# Fix functions
fix_missing_dependency() {
    local logs=$1
    local module=$(echo "$logs" | grep -oP "Can't resolve '\K[^']+")
    
    if [ ! -z "$module" ]; then
        echo -e "${BLUE}📦 Installing missing module: $module${NC}"
        npm install $module
    fi
}

fix_typescript_error() {
    echo -e "${BLUE}🔧 Running TypeScript check...${NC}"
    npx tsc --noEmit
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ TypeScript errors found - please fix manually${NC}"
    fi
}

check_env_variables() {
    echo -e "${BLUE}🔐 Checking environment variables...${NC}"
    
    if [ -f .env.example ]; then
        echo "Required variables from .env.example:"
        grep "^[A-Z_]" .env.example | cut -d'=' -f1 | while read var; do
            echo "  - $var"
        done
    fi
    
    echo -e "${YELLOW}⚠️ Please ensure all environment variables are set in Vercel${NC}"
}

fix_memory_error() {
    echo -e "${BLUE}💾 Updating build script with memory limit...${NC}"
    
    # Update package.json build script
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json'));
    pkg.scripts.build = 'NODE_OPTIONS=\"--max-old-space-size=4096\" next build';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    
    echo -e "${GREEN}✅ Memory limit increased${NC}"
}

fix_database_migration() {
    echo -e "${BLUE}🗄️ Running database migration...${NC}"
    
    npm run db:push:safe
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration successful${NC}"
    else
        echo -e "${RED}❌ Migration failed - manual intervention required${NC}"
    fi
}

trigger_deployment() {
    echo -e "${BLUE}🚀 Triggering new deployment...${NC}"
    
    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        git add -A
        git commit -m "fix: Automated build fix by deployment monitor"
        git push
        echo -e "${GREEN}✅ Deployment triggered${NC}"
    else
        echo "No changes to deploy"
    fi
}

# Main monitoring loop
LAST_DEPLOYMENT_ID=""

while true; do
    deployment=$(get_latest_deployment)
    
    if [ ! -z "$deployment" ]; then
        current_id=$(echo $deployment | jq -r '.uid')
        
        # Check if this is a new deployment
        if [ "$current_id" != "$LAST_DEPLOYMENT_ID" ]; then
            LAST_DEPLOYMENT_ID=$current_id
            check_deployment "$deployment"
        fi
    else
        echo -e "${YELLOW}⚠️ No deployments found${NC}"
    fi
    
    sleep $CHECK_INTERVAL
done
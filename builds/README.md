# Builds Directory Structure

This directory contains organized build artifacts for different deployment environments following the three-tier deployment strategy.

## Directory Structure

### 📱 Replit Dev/
**Purpose**: Development environment builds for testing and local development
- **Target**: Development testing and mobile app development
- **Backend**: http://localhost:5000 (Replit workspace)
- **Database**: Development Neon database (`rishiapp_dev`)
- **Build Type**: Mobile static export builds for VoltBuilder compilation

### 🚀 Replit Autoscale Staging/
**Purpose**: Staging environment builds for client testing and validation
- **Target**: https://rishi-staging.replit.dev
- **Backend**: Replit Autoscale deployment
- **Database**: Staging Neon database (`rishiapp_staging`) 
- **Build Type**: Server-side rendering builds for staging validation

### 🌐 Vercel Production/
**Purpose**: Production environment builds for live deployment
- **Target**: https://rishi-platform.vercel.app
- **Backend**: Vercel production deployment
- **Database**: Production Neon database (`rishiapp_prod`)
- **Build Type**: Optimized production builds for live users

## Build Naming Convention

Each folder should contain **1 current build file** following this pattern:
- `rishi-[environment]-[YYYY-MM-DD-HHMM].zip`

Examples:
- `rishi-dev-2025-01-24-1430.zip`
- `rishi-staging-2025-01-24-1430.zip` 
- `rishi-production-2025-01-24-1430.zip`

## Usage

1. **Development Builds**: Create mobile app packages for VoltBuilder compilation
2. **Staging Builds**: Deploy to Replit Autoscale for client testing
3. **Production Builds**: Deploy to Vercel for live user access

## Build Scripts

- Development: `scripts/build-mobile.sh` (creates VoltBuilder packages)
- Staging: Deploy to Replit Autoscale via UI
- Production: Deploy to Vercel via UI or CI/CD
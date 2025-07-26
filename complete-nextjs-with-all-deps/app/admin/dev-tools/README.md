# Developer Tools Dashboard

## Overview
Interactive dashboard for executing development scripts and utilities with one-click execution from the web interface.

## Features

### Database Operations
- **Push Database Schema**: Apply schema changes to database (`npm run db:push`)
- **Open Database Studio**: Launch Drizzle Studio for database management (`npm run db:studio`)
- **Generate Migration**: Generate new database migration (`npm run db:generate`)

### Build Operations
- **Development Build**: Standard Next.js build for development
- **Mobile Builds**: One-click mobile app builds for all environments:
  - Development: `./scripts/build-mobile.sh development`
  - Staging: `./scripts/build-mobile.sh staging`
  - Production: `./scripts/build-mobile.sh production`

### Utilities
- **Lint Code**: Run ESLint on the entire codebase
- **Type Check**: Run TypeScript type checking
- **Run Tests**: Execute the test suite
- **Clean Build Cache**: Remove .next and node_modules/.cache

### Logging
- **Development Logs**: View development server logs
- **Database Logs**: View database connection logs

## Security

### Command Whitelisting
All commands are validated against a whitelist for security:
- Only pre-approved commands can be executed
- No arbitrary command execution allowed
- All commands run with application server permissions

### Authentication
- Requires admin-level authentication
- Protected behind RBAC system
- Only super_admin role can access

## Usage

1. Navigate to `/admin/dev-tools`
2. Select appropriate tab (Database, Build, Utilities, Logs)
3. Click "Execute" on desired script
4. View real-time output and execution status
5. Monitor execution time and success/failure status

## Output Display
- Real-time status indicators (running, success, error)
- Execution time tracking
- Full command output display
- Color-coded success/error states
- Scrollable output areas for long outputs

## Integration
- Integrated with main navigation for super_admin users
- Uses existing authentication system
- Leverages platform's UI components and styling
- Follows platform security patterns
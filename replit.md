# Rishi Platform

## Overview

The Rishi Platform is a comprehensive, multi-tier application built with Next.js 15.2.2, designed for client organizations requiring robust staff leasing, event management, and white-label solutions. It features role-based access control (RBAC) and multi-organization support, catering specifically to the cannabis industry while maintaining a generic "Rishi Platform" brand identity. The project aims to provide a scalable and secure solution for workforce management with a focus on operational efficiency and data integrity.

## User Preferences

### Communication Style

- **CRITICAL**: Always refer to the platform as "Rishi Platform" only
- Never use "cannabis workforce management platform" or similar descriptors
- Platform operates in cannabis industry but should be called "Rishi Platform"
- **ACCURACY REQUIRED**: User frustrated with premature "deployment ready" claims over past week
- Distinguish between build compilation success and actual deployment success
- Only claim deployment readiness after successful Vercel deployment, not just build success
- Build compilation working ≠ successful Vercel deployment

### ⚠️ CRITICAL SECURITY RULES - MANDATORY COMPLIANCE

**🚨 ABSOLUTE PROHIBITION ON FALLBACK METHODS:**
- **NEVER** use fallback methods anywhere in the application
- **NEVER** use `|| "fallback-value"` patterns for environment variables
- **NEVER** use `?? "default-value"` patterns for security-sensitive data
- **NEVER** use hardcoded database URLs or connection strings

**🔐 DATABASE CONNECTION SECURITY:**
- **NEVER** hardcode database URLs - ALL connections MUST use process.env.DATABASE_URL
- **NEVER** provide fallback database URLs - missing DATABASE_URL MUST cause application failure
- **NEVER** use localhost or default database connections as fallbacks
- **ALWAYS** validate DATABASE_URL exists before attempting database operations
- **ALWAYS** throw errors when DATABASE_URL is missing - no graceful degradation allowed

**🛡️ CONFIGURATION SECURITY:**
- **NEVER** hardcode JWT secrets, API keys, or authentication tokens
- **NEVER** provide default values for security-sensitive environment variables
- **NEVER** mask configuration errors with fallback values
- **ALWAYS** require explicit environment variable configuration
- **ALWAYS** fail fast when required configuration is missing

**⚡ SECURITY PRINCIPLE:**
- **FAIL FAST, FAIL LOUD** - Configuration errors must be immediately apparent
- **NO GRACEFUL DEGRADATION** - Security misconfigurations must prevent application startup
- **EXPLICIT CONFIGURATION** - All environment variables must be explicitly set
- **ZERO TOLERANCE** - Any fallback method is a security vulnerability

Preferred communication style: Simple, everyday language.

## System Architecture

The Rishi Platform employs a multi-platform 3-tier architecture: Development (local Replit), Production Web (Vercel), and Production Mobile (VoltBuilder via Capacitor).

**Core Architectural Patterns & Design:**

- **Frontend**: Next.js 15.2.2 with App Router, Shadcn/ui (on Radix UI), Tailwind CSS for styling, React Context for state, and TypeScript. UI/UX emphasizes a purple-teal brand scheme for consistency across all components and platforms.
- **Backend**: Next.js API routes as serverless functions, JWT-based authentication with NextAuth.js, Drizzle ORM with Neon PostgreSQL, AdvancedEventBus for event handling (circuit breakers, metrics, fault tolerance), and a repository pattern with adapter design for data access.
- **Multi-Organization Support**: Data isolation per organization with context switching, a three-tier service model (Staff Leasing, Event Staffing, White-label), and role-based permission inheritance. Features are modular and pluggable based on organization tier.
- **Mobile Architecture**: Hybrid web-to-native approach using Capacitor framework for Android/iOS apps compiled via VoltBuilder. Features dual environments (Staging Mobile connected to Replit Autoscale, Production Mobile connected to Vercel) with complete isolation of databases and API endpoints. Static export for mobile builds with remote API integration.
- **Data Flow**: Client requests pass through middleware for authentication and RBAC, then to API handlers, interacting with the database via Drizzle ORM. AdvancedEventBus manages internal event flow for business logic, ensuring robustness and observability.
- **Key Features**: Comprehensive authentication/authorization with multiple user roles, a normalized database schema (Users, Organizations, Bookings, Locations, Kit Templates, Activity Kits), a pluggable feature module system, and Google Maps integration (Places API, JavaScript API).
- **Offline Support**: Entire application functions offline, including dashboard, bookings, locations, staff, inventory, analytics, reports, and training modules. This is achieved through comprehensive data caching, intelligent preloading, and a background sync queue for requests.

## External Dependencies

- **Database**: Neon PostgreSQL (`@neondatabase/serverless`, `drizzle-orm`)
- **Authentication**: NextAuth.js (`next-auth`, `jose`)
- **UI Components**: Shadcn/ui (`@radix-ui/*`), Tailwind CSS (`tailwindcss`)
- **Google Services**: Google Maps JavaScript API, Google Places API (`@googlemaps/js-api-loader`)
- **Mobile App Building**: VoltBuilder, Capacitor
- **Event Coordination**: Redis (Replit Redis Cloud for staging, Upstash Redis for production)

## Mobile App Deployment Status

### Native Mobile Build (PWA + Capacitor)
- **Build Commands**: 
  - `./build-native-staging.sh` - Staging mobile build for rishi-staging.replit.app
  - `./build-native-prod.sh` - Production mobile build for rishi-next.vercel.app
  - `./build-simple-mobile.sh` - Quick staging mobile wrapper (recommended for testing)
- **Outputs**: 
  - `release/rishi-capacitor-staging.zip` (2.0MB) - Staging build ready for VoltBuilder
  - `release/rishi-capacitor-prod.zip` (2.0MB) - Production build ready for VoltBuilder
- **Architecture**: Capacitor native wrapper with centralized API calls via apiFetch()
- **API Integration**: Environment-specific API base URLs configured via NEXT_PUBLIC_API_BASE_URL
  - Staging: https://rishi-staging.replit.app
  - Production: https://rishi-next.vercel.app
- **Service Worker**: Comprehensive offline support with smart caching strategies
- **Security**: HTTPS-only communication, no cleartext traffic allowed

### VoltBuilder Configuration
- **App ID**: `co.rishi.app`
- **App Name**: Rishi Platform
- **Platforms**: Android (APK) and iOS (App Store)
- **Android**: Min SDK 24, Target SDK 34, keystore alias: `rishi-android`
- **iOS**: Deployment target 13.0, provisioning: `rishi-ios-appstore`, cert: `rishi-ios-dist`

### 3-Environment Architecture
- **Development**: Local Replit development
- **Staging**: `https://rishi-staging.replit.app` (Replit Autoscale)
- **Production**: `https://rishi-next.vercel.app` (Vercel)
- **Native Apps**: Connect to production APIs (Neon PostgreSQL, Upstash Redis)
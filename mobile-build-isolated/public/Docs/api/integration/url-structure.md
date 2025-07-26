# URL Structure & Organization

## Overview

This document outlines the URL structure for the Rishi platform, including our approach to organizing feature-based code while maintaining a clean, logical URL structure for users.

## URL Organization Principles

1. **Feature-Based Code Organization**: Code is organized by feature rather than technical layers
2. **Logical URL Hierarchy**: URLs follow a logical pattern that reflects user roles and application areas
3. **Middleware Mapping**: Middleware handles the mapping between URL structure and code location
4. **Backwards Compatibility**: Support for legacy URLs during the transition

## URL Structure

The Rishi platform uses a hierarchical URL structure organized by user role and feature area:

### Role-Based Primary Segments

- `/agent/*`: Features specific to brand agents
- `/admin/*`: Administrative features and settings
- `/user/*`: End-user (client) specific features
- `/settings/*`: User-agnostic settings and configuration

### Feature-Based Secondary Segments

- `/agent/availability`: Brand agent availability management
- `/agent/event-requests`: Client event scheduling requests
- `/admin/employees`: Employee management
- `/admin/access-control`: Permission and role management
- `/user/profile`: User profile management
- `/settings/security`: Security settings

### API Endpoints

API endpoints follow a similar structure:

- `/api/agent/availability`: Availability management API
- `/api/admin/employees`: Employee management API
- `/api/auth/*`: Authentication and authorization API

## Implementation via Middleware

### URL Mapping

The system uses Next.js middleware (`middleware.ts`) to map between user-facing URLs and the actual code organization:

```typescript
// URL reorganization mapping for redirects
const urlRedirectMap = {
  "/availability": "/agent/availability",
  "/profile": "/user/profile",
  "/security": "/settings/security",
  // ...more mappings
};

// Temporary reverse mapping until proper directory structure is in place
const reverseUrlMap = {
  "/agent/availability": "/availability",
  "/user/profile": "/profile",
  "/settings/security": "/security",
  // ...more mappings
};
```

### Benefits of This Approach

1. **Clean URLs for Users**: URLs are intuitive and reflective of the application structure
2. **Developer Flexibility**: Developers can organize code by feature while maintaining clean URLs
3. **SEO Benefits**: Structured, meaningful URLs improve search engine optimization
4. **Gradual Migration**: Legacy URLs continue to work during the transition process
5. **Reduced Refactoring Risk**: Code can be reorganized without breaking URLs

## Migration Strategy

1. **Phase 1 (Current)**: Use middleware to map between clean URLs and legacy code locations
2. **Phase 2**: Gradually move code to match the URL structure, updating the mappings as we go
3. **Phase 3**: Complete the migration, remove legacy mappings, standardize on the new structure

## Technical Implementation

The mapping is implemented in `middleware.ts` using Next.js middleware capabilities:

1. **Redirection**: Legacy URLs redirect to new URL pattern (browser URL changes)
2. **Rewriting**: New URLs are internally rewritten to match current code location (browser URL stays the same)

## URL Pattern Examples

### Before (Legacy)

- `/availability` → Availability management page
- `/profile` → User profile page
- `/employees` → Employee management page

### After (New Structure)

- `/agent/availability` → Availability management page
- `/user/profile` → User profile page
- `/admin/employees` → Employee management page

## Future Considerations

- **Internationalization**: URL structure designed to accommodate future i18n paths
- **Versioning**: API endpoints may include version indicators in the future
- **Subfolder Deployment**: Structure supports deployment to subfolders if needed
- **Deep Linking**: Consistent structure facilitates deep linking into application features

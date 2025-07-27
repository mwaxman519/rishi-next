# Super Admin Navigation Redesign

## Current Issues

1. **Overlapping categories**: Roles, RBAC Dashboard, Org Permissions create confusion
2. **Multiple tabs highlighting**: Active state logic conflicts
3. **Poor grouping**: Related functions scattered across different sections
4. **Cognitive overload**: Too many similar-sounding options

## Proposed Information Architecture

### Core Principle: Group by User Intent and Mental Models

```
SUPER ADMIN NAVIGATION

├── 📊 Dashboard
│
├── 🏢 Organizations
│   ├── Organization List
│   ├── Organization Settings
│   └── Cross-Org Analytics
│
├── 👥 Users & Access
│   ├── User Management
│   ├── Access Control (consolidates RBAC settings)
│   │   ├── System Defaults
│   │   ├── Organization Overrides
│   │   └── Permission Matrix
│   └── User Analytics
│
├── 🎯 Operations
│   ├── Events
│   ├── Locations
│   ├── Staff Management
│   └── Integrations
│
├── ⚙️ System
│   ├── Platform Settings
│   ├── Feature Management
│   ├── Database Tools
│   └── API Management
│
├── 🔍 Monitoring
│   ├── System Status
│   ├── Security Monitoring
│   ├── Performance Analytics
│   └── Audit Logs
│
└── 🔧 Tools
    ├── Test Data
    ├── Debug Console
    └── Documentation
```

## RBAC Consolidation Strategy

**Before**: Scattered across Roles, RBAC Dashboard, Org Permissions
**After**: Single "Access Control" section with clear sub-functions

This eliminates confusion about where to manage permissions.

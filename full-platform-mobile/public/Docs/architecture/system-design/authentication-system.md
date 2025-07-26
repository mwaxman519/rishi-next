# Authentication System Architecture

## 1. Overview

The authentication system in the Rishi Workforce Management platform is a comprehensive solution that secures both client-side and server-side resources. It uses a layered approach with multiple security mechanisms to ensure proper authentication and authorization across the application.

## 2. Architecture Components

The authentication system is composed of the following key components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Authentication System                          │
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────────┐    │
│  │  Client-Side  │    │  Server-Side  │    │  Edge Middleware  │    │
│  │     Auth      │    │     Auth      │    │                   │    │
│  └───────────────┘    └───────────────┘    └───────────────────┘    │
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────────┐    │
│  │ useAuth Hook  │    │  Auth API     │    │   RBAC System     │    │
│  │               │    │  Endpoints    │    │                   │    │
│  └───────────────┘    └───────────────┘    └───────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.1 Client-Side Authentication

The client-side authentication is built around the `useAuth` hook that provides authentication state and functions to React components. This hook:

- Fetches the current user state
- Provides login, logout, and registration mutations
- Manages the authentication state via React Context
- Integrates with the TanStack Query cache for state management

### 2.2 Server-Side Authentication

The server-side authentication is implemented through:

- NextAuth.js for session management in production
- API routes for login, logout, registration, and user information
- JWT validation and verification in middleware
- Server-side sessions with secure, HTTP-only cookies

### 2.3 Edge Middleware

The Edge middleware provides route protection at the network level, handling:

- Authentication verification for protected routes
- Role-based access control using headers
- Organization context propagation
- Security headers and CSP implementation

### 2.4 RBAC System

The Role-Based Access Control system:

- Defines permissions for different user roles
- Maps routes to required permissions
- Provides hooks for component-level permission checks
- Implements multilevel access control for organizations

## 3. Authentication Flow

### 3.1 Login Flow

```
┌──────────┐     ┌────────────┐     ┌────────────┐     ┌─────────────┐
│  User    │     │ Login Form │     │ Login API  │     │  Auth Store │
│          │     │            │     │ Endpoint   │     │             │
└────┬─────┘     └─────┬──────┘     └─────┬──────┘     └──────┬──────┘
     │  Enter         │                   │                   │
     │  Credentials   │                   │                   │
     │ ─────────────> │                   │                   │
     │                │                   │                   │
     │                │  POST /api/auth/login                │
     │                │ ──────────────────>                  │
     │                │                   │                   │
     │                │                   │ Validate & Create Session
     │                │                   │ ─────────────────>
     │                │                   │                   │
     │                │                   │ Return User Data  │
     │                │                   │ <─────────────────
     │                │  Return User &    │                   │
     │                │  Set Cookies      │                   │
     │                │ <──────────────────                  │
     │                │                   │                   │
     │                │ Update Auth       │                   │
     │                │ Context          │                   │
     │                │ ───────────────────────────────────> │
     │                │                   │                   │
     │  Redirect to   │                   │                   │
     │  Dashboard     │                   │                   │
     │ <─────────────────────────────────────────────────────
     │                │                   │                   │
```

### 3.2 Route Protection Flow

```
┌──────────┐     ┌────────────┐     ┌────────────┐     ┌─────────────┐
│  User    │     │ Edge       │     │ Protected  │     │  Auth API   │
│          │     │ Middleware │     │ Route      │     │ Endpoint    │
└────┬─────┘     └─────┬──────┘     └─────┬──────┘     └──────┬──────┘
     │  Request        │                   │                   │
     │  Protected      │                   │                   │
     │  Route          │                   │                   │
     │ ─────────────> │                   │                   │
     │                │                   │                   │
     │                │ Check Token       │                   │
     │                │ ──────────────────>                  │
     │                │                   │                   │
     │                │                   │ If no token,      │
     │                │                   │ redirect to login │
     │                │                   │                   │
     │                │                   │ If token, validate│
     │                │                   │ with RBAC        │
     │                │                   │ ────────────────> │
     │                │                   │                   │
     │                │                   │                   │
     │                │                   │ Return permission │
     │                │                   │ status           │
     │                │                   │ <────────────────
     │                │                   │                   │
     │                │                   │ If allowed, render│
     │                │                   │ component         │
     │                │                   │                   │
     │ Page Loads or  │                   │                   │
     │ Redirect       │                   │                   │
     │ <─────────────────────────────────────────────────────
     │                │                   │                   │
```

## 4. Key Files and Their Roles

### 4.1 Client-Side Authentication Files

- `client/src/hooks/use-auth.tsx`: Provides the authentication context and hook
- `client/src/lib/protected-route.tsx`: Client-side route protection component
- `client/src/pages/auth-page.tsx`: Authentication page with login/registration forms
- `client/src/lib/queryClient.ts`: API request utilities and query cache management

### 4.2 Server-Side Authentication Files

- `app/api/auth/[...nextauth]/route.ts`: NextAuth.js implementation
- `app/api/auth/login/route.ts`: Login API endpoint
- `app/api/auth/register/route.ts`: Registration API endpoint
- `app/api/auth/logout/route.ts`: Logout API endpoint
- `app/api/auth/me/route.ts`: Current user information endpoint
- `app/lib/auth.ts`: Authentication utility functions

### 4.3 Edge Middleware and Protection

- `middleware.ts`: Edge middleware for route protection
- `app/components/ProtectedRoute.tsx`: Server component for route protection
- `app/lib/rbac.ts`: Role-based access control implementation

## 5. Authentication Models

### 5.1 User Model

```typescript
interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role: string;
  organizationId?: string;
  isActive?: boolean;
}
```

### 5.2 Login and Registration Models

```typescript
interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

### 5.3 JWT Payload Structure

```typescript
interface JwtPayload {
  id: string;
  username: string;
  role: string;
  fullName: string;
  organizationId: string;
  organizationRole: string;
  regionIds: string[];
  iat: number;
  exp: number;
}
```

## 6. Security Considerations

### 6.1 Token Storage

- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- Refresh tokens with short expiration times for session management
- Secure and SameSite cookie attributes to prevent CSRF

### 6.2 Authorization Checks

- Multi-layered permission checks at the UI, API, and data access levels
- Route-specific permission requirements
- Component-level permission guards

### 6.3 Protection Against Common Attacks

- CSRF protection through token validation
- XSS protection with Content Security Policy headers
- Rate limiting on authentication endpoints
- Input sanitization and validation

## 7. Development Mode Considerations

During development:

- Mock authentication is used to simplify development workflow
- JWT verification is bypassed in middleware
- User and permission data is mocked for testing
- Security headers are relaxed for local development

## 8. Production Considerations

For production deployment:

- Full JWT verification is enforced
- Security headers are strictly applied
- Database-backed session storage is utilized
- Proper logging of authentication events
- Token rotation and revocation strategies are implemented

## 9. Future Enhancements

Planned improvements to the authentication system:

- OAuth/OIDC integration for external identity providers
- Multi-factor authentication support
- Enhanced audit logging for security events
- Passwordless authentication options
- Session management improvements

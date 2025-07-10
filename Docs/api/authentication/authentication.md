# Authentication API

## Overview

The Authentication API handles user registration, login, logout, and token verification. These endpoints manage the authentication state of users and provide secure access to the platform.

## Base URL

All API endpoints are relative to the base URL:

```
/api/auth
```

## Authentication Endpoints

### Register

Creates a new user account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:

```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "fullName": "string (optional)",
  "email": "string (optional)",
  "role": "string (optional)"
}
```

**Success Response**:

```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "role": "string",
    "fullName": "string (optional)"
  },
  "token": "string"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Login

Authenticates a user and returns a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response**:

```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "role": "string",
    "fullName": "string (optional)"
  },
  "token": "string"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Logout

Logs out the current user by clearing the authentication cookie.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes

**Success Response**:

```json
{
  "success": true
}
```

### Me

Returns information about the currently authenticated user.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response**:

```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "role": "string",
    "fullName": "string (optional)"
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Not authenticated"
}
```

## Authentication Flow

1. **Registration**: New users call the `/api/auth/register` endpoint to create an account
2. **Login**: Users authenticate with the `/api/auth/login` endpoint, which returns a JWT token
3. **Token Storage**: The token is stored in an HTTP-only cookie for secure storage
4. **Auth Check**: Protected routes check the validity of the token using the `/api/auth/me` endpoint
5. **Logout**: Users call the `/api/auth/logout` endpoint to end their session

## Security Considerations

- Passwords are hashed using Argon2 or bcrypt before storage
- JWT tokens are signed with a secure secret key
- Tokens are stored in HTTP-only cookies to prevent JavaScript access
- Token expiration is set to 24 hours by default
- The authentication middleware validates tokens on every protected request

## Implementation Notes

The authentication system is implemented using the following components:

- `authService.ts`: Core authentication logic (login, register, verify)
- `auth-server.ts`: Server-side authentication utilities
- `auth-edge.ts`: Edge middleware authentication utilities
- `auth-client.ts`: Client-side authentication utilities
- `middleware.ts`: Edge middleware for route protection

For more information about the authentication architecture, see the [Authentication Architecture](../features/authentication) document.

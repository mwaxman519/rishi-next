# Auth Microservice Migration Plan

This document outlines the step-by-step plan to migrate the existing authentication system to the new auth microservice architecture within Next.js.

## Current Architecture

- Authentication is handled directly in the main application
- Routes are defined in `/app/api/auth/[endpoint]`
- `useAuth` hook provides client-side authentication

## Target Architecture

- Authentication is handled by a dedicated microservice
- Routes are defined in `/app/api/auth-service/routes/[endpoint]`
- `useAuth` hook uses `useAuthService` client to interact with the microservice
- Clear separation of concerns with microservice having its own models, utilities, and middleware

## Migration Steps

### Phase 1: Parallel Implementation (Current Status)

1. ✅ Set up basic microservice directory structure
2. ✅ Implement core utilities (jwt, password, response)
3. ✅ Create database connection and user repository
4. ✅ Implement microservice API routes (login, logout, register, session)
5. ✅ Create client-side auth service hook

### Phase 2: Testing and Validation

1. ✅ Create test endpoint to verify microservice functionality
2. ⬜ Test login and session retrieval with the new microservice
3. ⬜ Validate error handling and edge cases
4. ⬜ Test development mode bypass functionality

### Phase 3: Switchover

1. ⬜ Rename existing implementation files with .old extension
2. ⬜ Move new implementation files to their final locations:
   - Replace `app/hooks/useAuth.tsx` with `app/hooks/useAuth.new.tsx`
3. ⬜ Update any imports that may be using the old implementation
4. ⬜ Test the switchover in development environment

### Phase 4: Production Deployment

1. ⬜ Deploy to production with the new auth microservice
2. ⬜ Monitor for any authentication issues
3. ⬜ Be prepared to rollback if necessary

## Testing Plan

- Test login flow with valid credentials
- Test login with invalid credentials
- Test session persistence
- Test logout functionality
- Test registration process
- Test authorization with different user roles
- Test development mode features

## Rollback Plan

If issues are encountered:

1. Revert to the `.old` files
2. Revert imports to use the old implementation
3. Deploy the rollback

## Long-term Considerations

- Consider extracting the auth microservice to its own repository in the future
- Implement rate limiting and additional security features
- Set up monitoring and logging specifically for the auth service

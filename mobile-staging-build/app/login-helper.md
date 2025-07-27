# Login Instructions for Testing

## Authentication Required

To access the organization dropdown and settings, you must first log in:

1. **Go to Login Page**: Navigate to `/auth/login`
2. **Enter Credentials**: 
   - Username: `mike`
   - Password: `wrench519`
3. **After Login**: You'll be redirected to the dashboard
4. **Organization Access**: Once logged in, you'll see:
   - Organization dropdown in the header with 5 organizations
   - Access to `/settings/organizations` page
   - Ability to switch between organizations

## Test Organizations Available

After logging in as super admin, you'll have access to:

1. **Rishi Internal** (default) - Internal/Super Admin
2. **Green Leaf Cannabis** - Tier 2 Client
3. **MedTech Solutions** - Tier 3 Client  
4. **Cannabis Connect** - Tier 1 Client
5. **Harvest Partners** - Tier 2 Client

## URLs to Test

- `/auth/login` - Login page
- `/settings/organizations` - Organization management page (requires login)
- `/admin/organizations/settings` - Organization settings page
- `/dashboard` - Main dashboard (requires login)

## Current Authentication Status

The console shows you're not authenticated yet. Use the login credentials above to access all features.
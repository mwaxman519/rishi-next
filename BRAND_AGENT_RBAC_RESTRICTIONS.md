# Brand Agent RBAC Access Restrictions

## Problem Identified
Brand agents were incorrectly given access to workforce management features, which violates proper role-based access control principles.

## Changes Made

### REMOVED from Brand Agent Navigation:
- ❌ **Locations** - Brand agents should not manage locations
- ❌ **Workforce** - This is a management feature, not for individual agents

### RESTRICTED Access Labels:
- ✅ "Availability" → "My Availability" (personal only)
- ✅ "Tasks" → "My Tasks" (personal only)
- ✅ "Bookings" → "My Bookings" (personal only)

### Brand Agent Appropriate Access:
- ✅ Dashboard (personal overview)
- ✅ My Schedule (personal schedule view)
- ✅ My Availability (set personal availability)
- ✅ My Bookings (view assigned bookings)
- ✅ My Tasks (view assigned tasks)
- ✅ Event Data (data entry for events they work)
- ✅ Training (access training materials)

## RBAC Principle Applied
**Brand agents should only access their own work-related information and cannot manage other staff or organizational resources.**

## Security Benefits
- Prevents unauthorized access to workforce management
- Ensures agents can only see their own data
- Maintains proper separation of concerns
- Aligns with principle of least privilege

## Next Steps
- Verify backend API routes enforce these restrictions
- Ensure brand agents cannot access admin or management endpoints
- Test that UI properly hides management features for brand agents
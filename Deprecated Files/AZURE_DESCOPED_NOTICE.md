# Azure Deployments - Completely Descoped

## Current Status: **DESCOPED**

Azure deployments have been completely removed from the project scope and are tabled for future consideration.

## What This Means

- **No Azure Static Web Apps**: All Azure Static Web Apps configuration has been removed
- **No Azure Functions**: All Azure Functions integration has been removed
- **No Azure-specific optimizations**: All Azure-specific code has been removed
- **No Azure documentation**: All Azure deployment guides are deprecated

## Current Deployment Target

**Replit Autoscale** is our primary deployment target for both staging and production environments.

### Environment Configuration

- **Development**: Local Replit workspace
- **Staging**: Replit Autoscale deployment
- **Production**: Replit Autoscale deployment (when ready)

### Build Configuration

All builds now use:
- Server mode (no static export)
- Serverless functions through Replit Autoscale
- Dynamic API routes fully supported
- No Azure-specific tokens or configuration

## Files Updated

The following files have been updated to reflect the descoped status:

- `next.config.mjs` - Removed all Azure Static Web Apps configuration
- `replit.md` - Updated deployment strategy and architecture
- `STAGING_DEPLOYMENT_GUIDE.md` - Renamed to `REPLIT_AUTOSCALE_DEPLOYMENT_GUIDE.md`
- Various environment configurations

## Future Considerations

Azure deployments may be reconsidered in the future, but are currently completely out of scope for this project.

## Questions?

For any questions about the current deployment strategy, refer to the `REPLIT_AUTOSCALE_DEPLOYMENT_GUIDE.md` file.
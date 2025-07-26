# Multi-Tenancy Architecture

## Overview

The Rishi Platform implements a robust multi-tenant architecture that provides data isolation, customization, and scalability across multiple organizations while maintaining a single codebase.

## Tenancy Model

### Organization-Based Tenancy

Each organization represents a tenant with complete data isolation and customizable features.

```typescript
interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  customDomain?: string;
  tier: "basic" | "premium" | "enterprise";
  features: string[];
  settings: TenantSettings;
}
```

### Hierarchical Tenancy

Support for parent-child organization relationships for enterprise clients.

```typescript
interface OrganizationHierarchy {
  parentId?: string;
  children: Organization[];
  inheritSettings: boolean;
  sharedResources: string[];
}
```

## Data Isolation

### Database-Level Isolation

Each tenant's data is isolated using organization-specific filtering on all queries.

```typescript
export class TenantAwareRepository<T> {
  constructor(
    private table: any,
    private tenantField: string = "organizationId",
  ) {}

  async findAll(tenantId: string): Promise<T[]> {
    return db
      .select()
      .from(this.table)
      .where(eq(this.table[this.tenantField], tenantId));
  }

  async create(data: any, tenantId: string): Promise<T> {
    return db
      .insert(this.table)
      .values({
        ...data,
        [this.tenantField]: tenantId,
      })
      .returning();
  }
}
```

### Tenant Context Management

Automatic tenant context propagation throughout the application stack.

```typescript
export class TenantContext {
  private static context = new AsyncLocalStorage<string>();

  static run<T>(tenantId: string, callback: () => T): T {
    return this.context.run(tenantId, callback);
  }

  static getCurrentTenant(): string {
    const tenantId = this.context.getStore();
    if (!tenantId) {
      throw new Error("Tenant context not found");
    }
    return tenantId;
  }
}
```

## Tenant Resolution

### Subdomain-Based Resolution

Tenants can be accessed via subdomains (e.g., acme.rishi-platform.com).

```typescript
export function resolveTenantFromSubdomain(hostname: string): string | null {
  const subdomain = hostname.split(".")[0];

  // Skip www and API subdomains
  if (["www", "api", "admin"].includes(subdomain)) {
    return null;
  }

  return subdomain;
}
```

### Header-Based Resolution

API requests include tenant identification via headers.

```typescript
export function resolveTenantFromHeaders(request: Request): string | null {
  return (
    request.headers.get("x-tenant-id") ||
    request.headers.get("x-organization-id")
  );
}
```

## Configuration Management

### Tenant-Specific Settings

Each tenant can customize application behavior through settings.

```typescript
interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCSS?: string;
  };
  features: {
    enabledModules: string[];
    featureFlags: Record<string, boolean>;
  };
  integrations: {
    emailProvider?: string;
    smsProvider?: string;
    storageProvider?: string;
  };
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    mfaRequired: boolean;
  };
}
```

### Feature Flags

Tenant-specific feature enablement and A/B testing.

```typescript
export class FeatureService {
  async isFeatureEnabled(
    featureName: string,
    tenantId: string,
  ): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);

    // Check tier-based features
    if (this.isTierFeature(featureName, tenant.tier)) {
      return true;
    }

    // Check custom feature flags
    return tenant.settings.features.featureFlags[featureName] ?? false;
  }
}
```

## Resource Sharing

### Shared Resources

Some resources can be shared across tenants while maintaining isolation.

```typescript
interface SharedResource {
  id: string;
  type: "template" | "integration" | "asset";
  isGlobal: boolean;
  allowedTenants: string[];
  permissions: ResourcePermissions;
}
```

### Template Sharing

Event templates and workflows can be shared between organizations.

```typescript
export class TemplateService {
  async getAvailableTemplates(tenantId: string): Promise<Template[]> {
    // Get tenant-specific templates
    const tenantTemplates = await this.getTenantTemplates(tenantId);

    // Get shared templates accessible to this tenant
    const sharedTemplates = await this.getSharedTemplates(tenantId);

    return [...tenantTemplates, ...sharedTemplates];
  }
}
```

## Scaling and Performance

### Horizontal Scaling

Database sharding strategy for large-scale multi-tenancy.

```typescript
export class ShardingStrategy {
  private shards: DatabaseShard[];

  getShardForTenant(tenantId: string): DatabaseShard {
    const hash = this.hashTenantId(tenantId);
    const shardIndex = hash % this.shards.length;
    return this.shards[shardIndex];
  }

  private hashTenantId(tenantId: string): number {
    // Consistent hashing algorithm
    return tenantId.split("").reduce((hash, char) => {
      return (hash << 5) - hash + char.charCodeAt(0);
    }, 0);
  }
}
```

### Caching Strategy

Tenant-aware caching to prevent data leakage between tenants.

```typescript
export class TenantCache {
  private cache = new Map<string, any>();

  set(key: string, value: any, tenantId: string): void {
    const tenantKey = `${tenantId}:${key}`;
    this.cache.set(tenantKey, value);
  }

  get(key: string, tenantId: string): any {
    const tenantKey = `${tenantId}:${key}`;
    return this.cache.get(tenantKey);
  }
}
```

## Security Considerations

### Cross-Tenant Data Protection

Prevent accidental data access across tenant boundaries.

```typescript
export function validateTenantAccess(
  requestedTenantId: string,
  userTenants: string[],
): boolean {
  return userTenants.includes(requestedTenantId);
}

export function sanitizeTenantData<T>(data: T, allowedTenantId: string): T {
  // Remove or mask data that doesn't belong to the allowed tenant
  return data; // Implementation depends on data structure
}
```

### Audit Trail

Track all cross-tenant operations and access patterns.

```typescript
export class TenantAuditLogger {
  async logTenantAccess(
    userId: string,
    sourceTenant: string,
    targetTenant: string,
    operation: string,
  ): Promise<void> {
    await this.db.insert(tenantAuditLog).values({
      userId,
      sourceTenant,
      targetTenant,
      operation,
      timestamp: new Date(),
      metadata: this.getRequestMetadata(),
    });
  }
}
```

## Deployment Patterns

### Single Database, Multi-Schema

Each tenant gets its own database schema for logical separation.

```sql
-- Tenant-specific schema creation
CREATE SCHEMA tenant_acme;
CREATE SCHEMA tenant_brandx;

-- Table creation within tenant schema
CREATE TABLE tenant_acme.events (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Database Per Tenant

Complete database isolation for high-security requirements.

```typescript
export class DatabaseManager {
  private connections = new Map<string, Database>();

  getDatabase(tenantId: string): Database {
    if (!this.connections.has(tenantId)) {
      const dbConfig = this.getTenantDatabaseConfig(tenantId);
      this.connections.set(tenantId, new Database(dbConfig));
    }

    return this.connections.get(tenantId)!;
  }
}
```

## Migration and Maintenance

### Tenant Data Migration

Safe migration of tenant data during upgrades.

```typescript
export class TenantMigrationService {
  async migrateTenant(
    tenantId: string,
    migrationScript: string,
  ): Promise<void> {
    const database = this.databaseManager.getDatabase(tenantId);

    await database.transaction(async (tx) => {
      // Run migration in transaction for rollback capability
      await tx.raw(migrationScript);

      // Update migration version
      await this.updateMigrationVersion(tenantId, migrationScript);
    });
  }
}
```

### Backup Strategy

Tenant-specific backup and recovery procedures.

```typescript
export class TenantBackupService {
  async backupTenant(tenantId: string): Promise<string> {
    const backupId = generateUUID();

    // Create tenant-specific backup
    await this.createDatabaseBackup(tenantId, backupId);
    await this.createFileBackup(tenantId, backupId);

    return backupId;
  }

  async restoreTenant(tenantId: string, backupId: string): Promise<void> {
    await this.restoreDatabaseBackup(tenantId, backupId);
    await this.restoreFileBackup(tenantId, backupId);
  }
}
```

## Monitoring and Analytics

### Tenant-Specific Metrics

Monitor performance and usage per tenant.

```typescript
export class TenantMetrics {
  async getTenantUsage(tenantId: string): Promise<TenantUsageStats> {
    return {
      activeUsers: await this.countActiveUsers(tenantId),
      storageUsed: await this.calculateStorageUsage(tenantId),
      apiCalls: await this.countApiCalls(tenantId),
      events: await this.countEvents(tenantId),
    };
  }
}
```

## Best Practices

### Design Principles

- Always include tenant ID in data models
- Use tenant-aware repositories and services
- Implement proper tenant context management
- Ensure complete data isolation
- Plan for horizontal scaling from the start

### Security Guidelines

- Never trust client-provided tenant IDs
- Validate tenant access for every operation
- Implement comprehensive audit logging
- Use tenant-specific encryption keys where possible
- Regular security audits across tenant boundaries

## Related Documentation

- [Organization Service](../microservices/organization-service.md)
- [RBAC System](../rbac/README.md)
- [API Security](../api/security.md)

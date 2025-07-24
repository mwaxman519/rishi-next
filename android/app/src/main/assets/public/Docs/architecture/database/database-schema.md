# Database Schema Documentation

## Overview

The Cannabis Workforce Management Platform uses a PostgreSQL database with Drizzle ORM for type-safe database operations. The database schema is defined in `shared/schema.ts` and follows a modular approach with clear entity relationships.

## Database Configuration

The application uses the Neon serverless PostgreSQL database:

```typescript
// server/db.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

// Create SQL executor with connection string from environment
export const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });
```

## Schema Definition

The database schema is defined in `shared/schema.ts` using Drizzle's type-safe schema definition:

```typescript
// shared/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Constants for enum values
export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  BRAND_AGENT: "BRAND_AGENT",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const EMPLOYEE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  SUSPENDED: "SUSPENDED",
} as const;

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

export const CERTIFICATION_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  PENDING: "PENDING",
  REVOKED: "REVOKED",
} as const;

export type CertificationStatus =
  (typeof CERTIFICATION_STATUS)[keyof typeof CERTIFICATION_STATUS];

export const FACILITY_TYPES = {
  DISPENSARY: "DISPENSARY",
  GROW_OPERATION: "GROW_OPERATION",
  PROCESSING: "PROCESSING",
  DISTRIBUTION: "DISTRIBUTION",
} as const;

export type FacilityType = (typeof FACILITY_TYPES)[keyof typeof FACILITY_TYPES];

export const SHIFT_TYPES = {
  REGULAR: "REGULAR",
  OVERTIME: "OVERTIME",
  HOLIDAY: "HOLIDAY",
  ON_CALL: "ON_CALL",
} as const;

export type ShiftType = (typeof SHIFT_TYPES)[keyof typeof SHIFT_TYPES];
```

### Core Tables

#### Users Table

```typescript
// Users table for authentication and user management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 50 }).notNull().default(USER_ROLES.USER),
  active: boolean("active").notNull().default(true),
  profileImage: varchar("profile_image", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Availability Blocks Table

```typescript
// Availability blocks for managing user availability
export const availabilityBlocks = pgTable("availability_blocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrencePattern: varchar("recurrence_pattern", { length: 50 }),
  dayOfWeek: integer("day_of_week"),
  recurrenceGroup: varchar("recurrence_group", { length: 100 }),
  recurrenceEndType: varchar("recurrence_end_type", { length: 20 }),
  recurrenceCount: integer("recurrence_count"),
  recurrenceEndDate: timestamp("recurrence_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Employees Table

```typescript
// Employees table for workforce management
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  hireDate: date("hire_date").notNull(),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  status: varchar("status", { length: 50 })
    .notNull()
    .default(EMPLOYEE_STATUS.ACTIVE),
  manager: integer("manager_id").references(() => employees.id),
  hourlyRate: integer("hourly_rate"),
  maxHoursPerWeek: integer("max_hours_per_week"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Facilities Table

```typescript
// Facilities table for managing locations
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 })
    .notNull()
    .default(FACILITY_TYPES.DISPENSARY),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseExpiry: date("license_expiry"),
  openingHours: text("opening_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Certifications Table

```typescript
// Certifications table for tracking employee credentials
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  certificationNumber: varchar("certification_number", { length: 100 }),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date"),
  status: varchar("status", { length: 50 })
    .notNull()
    .default(CERTIFICATION_STATUS.ACTIVE),
  documentUrl: varchar("document_url", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Shifts Table

```typescript
// Shifts table for scheduling
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  facilityId: integer("facility_id")
    .notNull()
    .references(() => facilities.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: varchar("type", { length: 50 }).notNull().default(SHIFT_TYPES.REGULAR),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Time Entries Table

```typescript
// Time entries for tracking hours worked
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").references(() => shifts.id, {
    onDelete: "cascade",
  }),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  totalHours: integer("total_hours"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

<!-- Compliance Incidents Table has been removed as not needed for this business -->

### Integration Tables

#### Google Calendar Integration

```typescript
// Google Calendar tokens for OAuth integration
export const googleCalendarTokens = pgTable("google_calendar_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Google Calendar settings for user preferences
export const googleCalendarSettings = pgTable("google_calendar_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  selectedCalendarIds: text("selected_calendar_ids").notNull().default("[]"),
  autoSync: boolean("auto_sync").notNull().default(false),
  syncFrequency: varchar("sync_frequency", { length: 20 })
    .notNull()
    .default("daily"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Zod Validation Schemas

The schema also defines Zod validation schemas for each entity:

```typescript
// Insert schemas for validation
export const insertItemSchema = createInsertSchema(items);
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  profileImage: true,
});
export const insertAvailabilityBlockSchema =
  createInsertSchema(availabilityBlocks);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertFacilitySchema = createInsertSchema(facilities);
export const insertCertificationSchema = createInsertSchema(certifications);
export const insertShiftSchema = createInsertSchema(shifts);
export const insertTimeEntrySchema = createInsertSchema(timeEntries);
// Compliance incident schema removed as not needed for this business
export const insertGoogleCalendarTokenSchema =
  createInsertSchema(googleCalendarTokens);
export const insertGoogleCalendarSettingSchema = createInsertSchema(
  googleCalendarSettings,
);
```

## Type Definitions

The schema exports TypeScript types for both insert and select operations:

```typescript
// Insert types
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAvailabilityBlock = z.infer<
  typeof insertAvailabilityBlockSchema
>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
// InsertComplianceIncident type removed as not needed for this business
export type InsertGoogleCalendarToken = z.infer<
  typeof insertGoogleCalendarTokenSchema
>;
export type InsertGoogleCalendarSetting = z.infer<
  typeof insertGoogleCalendarSettingSchema
>;

// Select types
export type Item = typeof items.$inferSelect;
export type User = typeof users.$inferSelect;
export type AvailabilityBlock = typeof availabilityBlocks.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
// ComplianceIncident type removed as not needed for this business
export type GoogleCalendarToken = typeof googleCalendarTokens.$inferSelect;
export type GoogleCalendarSetting = typeof googleCalendarSettings.$inferSelect;
```

## Repository Pattern Implementation

The application implements the repository pattern to abstract database operations:

### Storage Interface

```typescript
// server/storage.ts
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>;

  // Item operations
  getItem(id: number): Promise<Item | undefined>;
  getItems(): Promise<Item[]>;
  createItem(insertItem: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;

  // Availability operations
  getAvailabilityBlock(id: number): Promise<AvailabilityBlock | undefined>;
  getAvailabilityBlocksByUser(userId: number): Promise<AvailabilityBlock[]>;
  getAvailabilityBlocksByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityBlock[]>;
  createAvailabilityBlock(
    block: InsertAvailabilityBlock,
  ): Promise<AvailabilityBlock>;
  updateAvailabilityBlock(
    id: number,
    block: Partial<InsertAvailabilityBlock>,
  ): Promise<AvailabilityBlock | undefined>;
  deleteAvailabilityBlock(id: number): Promise<boolean>;

  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: number): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  getEmployeesByStatus(status: string): Promise<Employee[]>;
  getEmployeesByDepartment(department: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(
    id: number,
    employee: Partial<InsertEmployee>,
  ): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Facility operations
  getFacility(id: number): Promise<Facility | undefined>;
  getFacilities(): Promise<Facility[]>;
  getFacilitiesByType(type: string): Promise<Facility[]>;
  getFacilitiesByStatus(status: string): Promise<Facility[]>;
  createFacility(facility: InsertFacility): Promise<Facility>;
  updateFacility(
    id: number,
    facility: Partial<InsertFacility>,
  ): Promise<Facility | undefined>;
  deleteFacility(id: number): Promise<boolean>;

  // Certification operations
  getCertification(id: number): Promise<Certification | undefined>;
  getCertificationsByEmployee(employeeId: number): Promise<Certification[]>;
  getCertificationsByStatus(status: string): Promise<Certification[]>;
  getCertificationsExpiringBefore(date: Date): Promise<Certification[]>;
  createCertification(
    certification: InsertCertification,
  ): Promise<Certification>;
  updateCertification(
    id: number,
    certification: Partial<InsertCertification>,
  ): Promise<Certification | undefined>;
  deleteCertification(id: number): Promise<boolean>;

  // Shift operations
  getShift(id: number): Promise<Shift | undefined>;
  getShiftsByEmployee(employeeId: number): Promise<Shift[]>;
  getShiftsByFacility(facilityId: number): Promise<Shift[]>;
  getShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]>;
  getShiftsByEmployeeAndDateRange(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Shift[]>;
  getShiftsByFacilityAndDateRange(
    facilityId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(
    id: number,
    shift: Partial<InsertShift>,
  ): Promise<Shift | undefined>;
  deleteShift(id: number): Promise<boolean>;

  // TimeEntry operations
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntriesByEmployee(employeeId: number): Promise<TimeEntry[]>;
  getTimeEntriesByShift(shiftId: number): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TimeEntry[]>;
  getTimeEntriesByStatus(status: string): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(
    id: number,
    timeEntry: Partial<InsertTimeEntry>,
  ): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;

  // ComplianceIncident operations removed as not needed for this business
}
```

### Database Storage Implementation

```typescript
// server/storage.ts
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Additional method implementations...
}
```

## Repository Pattern in Services

The application uses the repository pattern for domain-specific data access:

```typescript
// app/services/availability/repository.ts
export class AvailabilityRepository {
  /**
   * Maps a database availability block entity to a domain DTO
   */
  private mapToAvailabilityDTO(block: AvailabilityBlock): AvailabilityDTO {
    return {
      id: block.id,
      userId: block.userId,
      title: block.title || "",
      startDate: block.startDate,
      endDate: block.endDate,
      status: block.status as "available" | "unavailable" | "tentative",
      isRecurring: block.isRecurring,
      recurrencePattern: block.recurrencePattern,
      dayOfWeek: block.dayOfWeek,
      recurrenceGroup: block.recurrenceGroup,
      recurrenceEndType: block.recurrenceEndType as "never" | "count" | "date",
      recurrenceCount: block.recurrenceCount,
      recurrenceEndDate: block.recurrenceEndDate,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    };
  }

  async findAll(options: AvailabilityQueryOptions): Promise<AvailabilityDTO[]> {
    try {
      // Build query based on options
      const query = db
        .select()
        .from(availabilityBlocks)
        .where(eq(availabilityBlocks.userId, options.userId));

      // Add date range filter if provided
      if (options.startDate && options.endDate) {
        const startDate = new Date(options.startDate);
        const endDate = new Date(options.endDate);

        query.where(
          or(
            // Non-recurring blocks that overlap with the date range
            and(
              lte(availabilityBlocks.startDate, endDate),
              gte(availabilityBlocks.endDate, startDate),
            ),
            // Recurring blocks where the recurrence pattern includes days in the range
            availabilityBlocks.isRecurring.equals(true),
          ),
        );
      }

      // Add status filter if provided
      if (options.status) {
        query.where(eq(availabilityBlocks.status, options.status));
      }

      // Execute query
      const blocks = await query;

      // Map database entities to DTOs
      return blocks.map((block: AvailabilityBlock) =>
        this.mapToAvailabilityDTO(block),
      );
    } catch (error) {
      console.error("Error finding availability blocks:", error);
      throw error;
    }
  }

  // Additional methods...
}

export const availabilityRepository = new AvailabilityRepository();
```

### User Repository

```typescript
// app/services/users/repository.ts
export class UserRepository {
  /**
   * Maps a database user entity to a domain user model
   */
  private mapToUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role as UserRole,
      active: user.active,
      profileImage: user.profileImage || undefined,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get all users
   */
  async findAll(): Promise<UserProfile[]> {
    try {
      const result = await db.select().from(users);
      return result.map((user) => this.mapToUserProfile(user));
    } catch (error) {
      console.error("Error finding all users:", error);
      throw error;
    }
  }

  // Additional methods...
}

export const userRepository = new UserRepository();
```

### Google Calendar Repository

```typescript
// app/services/googleCalendar/repository.ts
export class GoogleCalendarRepository {
  /**
   * Save Google Calendar tokens for a user
   */
  async saveTokens(
    userId: number,
    accessToken: string,
    refreshToken: string,
    expiryDate: Date,
  ): Promise<GoogleCalendarToken> {
    try {
      // Check if tokens already exist for this user
      const existingTokens = await db
        .select()
        .from(googleCalendarTokens)
        .where(eq(googleCalendarTokens.userId, userId))
        .limit(1);

      if (existingTokens.length > 0) {
        // Update existing tokens
        const result = await db
          .update(googleCalendarTokens)
          .set({
            accessToken,
            refreshToken,
            expiryDate,
            updatedAt: new Date(),
          })
          .where(eq(googleCalendarTokens.userId, userId))
          .returning();

        return this.mapToTokenModel(result[0]);
      } else {
        // Insert new tokens
        const result = await db
          .insert(googleCalendarTokens)
          .values({
            userId,
            accessToken,
            refreshToken,
            expiryDate,
          })
          .returning();

        return this.mapToTokenModel(result[0]);
      }
    } catch (error) {
      console.error("Error saving Google Calendar tokens:", error);
      throw error;
    }
  }

  // Additional methods...
}

export const googleCalendarRepository = new GoogleCalendarRepository();
```

## Database Migrations

The application uses Drizzle Kit for database migrations:

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/postgres",
  },
  verbose: true,
  strict: true,
});
```

### Migration Scripts

```typescript
// scripts/db-push.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Pushing schema to database...");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("Connecting to database...");

  try {
    // Push schema to database
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    console.log("Schema pushed successfully");
  } catch (error) {
    console.error("Error pushing schema:", error);
    process.exit(1);
  }
}

main();
```

## Database Relationships

The schema defines several relationships between tables:

1. **User to Employee** (1:1): Each user can have one employee record
2. **User to Availability Blocks** (1:N): Each user can have multiple availability blocks
3. **Employee to Shifts** (1:N): Each employee can have multiple shifts
4. **Facility to Shifts** (1:N): Each facility can have multiple shifts
5. **Employee to Certifications** (1:N): Each employee can have multiple certifications
6. **Shift to Time Entries** (1:N): Each shift can have multiple time entries
7. **Facility to Compliance Incidents relationship removed as not needed for this business**
8. **User to Google Calendar Tokens** (1:1): Each user can have one Google Calendar token record
9. **User to Google Calendar Settings** (1:1): Each user can have one Google Calendar settings record

## Data Access Patterns

### Direct Repository Usage

Services use repositories for data access:

```typescript
// app/services/availability/availabilityService.ts
class AvailabilityService {
  /**
   * Get all availability blocks for a user
   */
  async getAvailabilityBlocks(
    options: AvailabilityQueryOptions,
  ): Promise<AvailabilitiesResponse> {
    try {
      const blocks = await availabilityRepository.findAll(options);

      return {
        success: true,
        data: blocks,
      };
    } catch (error) {
      console.error("Error getting availability blocks:", error);
      return {
        success: false,
        error: "Failed to retrieve availability blocks",
      };
    }
  }

  // Additional methods...
}
```

### Storage Interface Usage

Some parts of the codebase use the general storage interface:

```typescript
// In API routes or services that need generic data access
const blocks = await storage.getAvailabilityBlocksByDateRange(
  userId,
  new Date(startDate),
  new Date(endDate),
);
```

## Best Practices

1. **Separation of Concerns**: Repositories handle data access, services handle business logic
2. **Strong Typing**: All database operations are strongly typed
3. **Error Handling**: Comprehensive error handling and logging
4. **Consistent Patterns**: Consistent repository and service patterns
5. **Data Validation**: Zod schemas validate input data
6. **Transaction Support**: Complex operations use transactions
7. **Performance Optimization**: Queries are optimized with proper indexes

## Future Enhancements

1. **Query Performance Monitoring**: Add query performance monitoring
2. **Connection Pooling**: Implement connection pooling for better performance
3. **Data Caching**: Add caching layer for frequently accessed data
4. **Audit Logging**: Implement audit logging for data changes
5. **Schema Versioning**: Add support for schema versioning

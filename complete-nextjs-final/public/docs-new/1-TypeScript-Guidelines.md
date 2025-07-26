# TypeScript Guidelines

## Overview

This document provides guidelines for maintaining type safety in the project, with a particular focus on preventing TypeScript errors that can cause build failures in production.

## Stricter TypeScript Configuration

We've updated the TypeScript configuration to be more strict, enabling additional compile-time checks:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

These settings help catch more potential issues during development rather than at build time.

## Type-Safe Utilities

We've created utility functions in `shared/utils.ts` to handle common type conversion scenarios, especially for date handling:

```typescript
// Convert Date objects to ISO strings for database storage
export function prepareDateForDB(
  date: Date | null | undefined,
): string | null | undefined {
  return date instanceof Date ? date.toISOString() : date;
}

// Convert ISO string dates from database to Date objects
export function prepareDBDateForApp(
  dateStr: string | null | undefined,
): Date | null | undefined {
  return typeof dateStr === "string" ? new Date(dateStr) : dateStr;
}
```

These utilities ensure consistent type handling throughout the application.

## Date Handling Best Practices

One of the most common type issues occurs with date handling. Always use the utility functions when working with dates:

```typescript
// When sending dates to the database
import { prepareDateForDB } from "@/shared/utils";

// INCORRECT
await db.insert(users).values({ birthDate: new Date() });

// CORRECT
await db.insert(users).values({ birthDate: prepareDateForDB(new Date()) });
```

## Pre-commit Hooks

A pre-commit hook has been set up in `scripts/pre-commit.js` that runs TypeScript checks before allowing code to be committed. This ensures that type errors are caught early in the development process.

To install the pre-commit hook:

```bash
# Make pre-commit hook executable
chmod +x scripts/pre-commit.js

# Link the hook to git
ln -s ../../scripts/pre-commit.js .git/hooks/pre-commit
```

## Regular Type Checking

We've added a script in `scripts/check-typescript.sh` to run TypeScript checks periodically. This script:

1. Runs the TypeScript compiler in strict mode
2. Attempts a partial build to catch more advanced type issues

Run this script regularly during development:

```bash
./scripts/check-typescript.sh
```

## Common Type Issues to Watch For

1. **Date handling**: Always convert between Date objects and ISO strings when working with the database.

2. **Nullable fields**: Always handle potentially null or undefined values explicitly.

3. **Type narrowing**: Use type guards to narrow types when necessary.

4. **Partial updates**: Use `Partial<Type>` when updating only some fields of a record.

By following these guidelines, we can prevent most TypeScript errors from reaching production builds.

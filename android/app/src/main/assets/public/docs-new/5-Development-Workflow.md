# Development Workflow

## Overview

This document outlines the recommended development workflow to maintain code quality, prevent TypeScript errors, and ensure smooth builds and deployments.

## Regular TypeScript Checks

Implement regular TypeScript checks as part of your development workflow to catch type errors early.

### Running TypeScript Check Script

We've added a script to check for TypeScript errors:

```bash
./scripts/check-typescript.sh
```

This script runs:

1. TypeScript compiler in strict mode
2. A partial build to catch more advanced type issues

### Pre-commit Hook

A pre-commit hook has been set up that runs TypeScript checks before allowing code to be committed:

```bash
# Make pre-commit hook executable
chmod +x scripts/pre-commit.js

# Link the hook to git (from the repository root)
ln -s ../../scripts/pre-commit.js .git/hooks/pre-commit
```

This hook ensures that type errors are caught before they make it into the codebase.

## Utility Functions

Use the utility functions in `shared/utils.ts` for common operations:

```typescript
import {
  prepareDateForDB,
  prepareDBDateForApp,
  toNumber,
  toBoolean,
  isDate,
  isISODateString,
} from "@/shared/utils";

// Use these utilities throughout your code for consistent type handling
```

## Development Process

### Feature Development

When developing new features:

1. **Start with types**: Define any necessary types in `shared/schema.ts` first
2. **Run frequent type checks**: Use `./scripts/check-typescript.sh` during development
3. **Use utility functions**: Leverage the utility functions for consistent type handling
4. **Test builds periodically**: Run a test build before submitting a pull request

### Code Review

During code reviews, pay special attention to:

1. **Type safety**: Ensure proper types are used throughout the code
2. **Date handling**: Verify date objects are properly converted for database operations
3. **Null/undefined handling**: Check for proper handling of potentially null values
4. **Type narrowing**: Ensure proper type narrowing with type guards where needed

### Commit Messages

Use descriptive commit messages with prefixes:

- `fix(types):` for type-related fixes
- `feat:` for new features
- `refactor:` for code refactoring
- `docs:` for documentation changes
- `chore:` for routine tasks and dependency updates

Example:

```
fix(types): Add proper date conversion in user creation function
```

## Build Process

### Regular Test Builds

Regularly run test builds to catch issues early:

```bash
# Quick partial build
npm run build -- --no-lint

# Full build
npm run build
```

### Memory Considerations

When running builds, be aware of memory usage:

```bash
# For large builds, increase memory allocation
NODE_OPTIONS="--max-old-space-size=3072" npm run build
```

### Build Scripts

Use the appropriate build script for your needs:

- `npm run build`: Standard development build
- `./optimized-production-build.sh`: Optimized production build
- `./ultra-minimal-build.sh`: Minimal build for testing

## Testing Deployment

Before submitting a pull request that affects production deployment:

1. **Run pre-deployment checks**:

   ```bash
   ./deployment-checklist.sh
   ```

2. **Verify database compatibility**:

   ```bash
   node verify-database.js
   ```

3. **Test middleware**:
   ```bash
   ./verify-middleware.sh
   ```

## Dependency Management

### Updating Dependencies

When updating dependencies:

1. Check for breaking changes in the release notes
2. Run TypeScript checks after updates
3. Test a production build

### Troubleshooting Dependencies

If you encounter build issues after updating dependencies:

1. Check for TypeScript version compatibility
2. Look for changes in type definitions
3. Verify compatibility with Next.js version

## Code Quality Tools

### ESLint

Use ESLint to catch potential issues:

```bash
npx next lint
```

### Type-Checking in Editor

Ensure your editor is set up with TypeScript support for real-time type checking.

For VS Code:

1. Install the TypeScript extension
2. Enable strict mode in your settings
3. Use the TypeScript version from the workspace

## Documentation

### Updating Documentation

When making significant changes to the codebase:

1. Update related documentation
2. Add code examples for complex operations
3. Document any type-related pitfalls

### Creating New Documentation

When creating new documentation:

1. Follow the existing format
2. Link to related documents
3. Add it to the table of contents in `README.md`

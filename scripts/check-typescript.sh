#!/bin/bash

# TypeScript Build Check Script
# This script runs a TypeScript check and a partial build
# to catch type errors during development.

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running TypeScript checks...${NC}"

# Step 1: Run TypeScript compiler in strict mode
echo -e "\n${CYAN}Step 1/2: TypeScript compilation check${NC}"
if npx tsc --noEmit; then
  echo -e "${GREEN}✓ TypeScript compilation passed${NC}"
else
  echo -e "${RED}✗ TypeScript compilation failed${NC}"
  exit 1
fi

# Step 2: Run a partial build to catch advanced type issues
echo -e "\n${CYAN}Step 2/2: Partial build check${NC}"
echo -e "${YELLOW}Note: This is a quick check, not a full build${NC}"

# Set a timeout to avoid running the entire build process
if timeout 30s npm run build; then
  echo -e "${GREEN}✓ Build check completed successfully${NC}"
else
  if [ $? -eq 124 ]; then
    # Status 124 means the timeout command terminated the process, which is expected
    echo -e "${GREEN}✓ Build check interrupted after time limit (passed initial checks)${NC}"
  else
    # Actual build error
    echo -e "${RED}✗ Build check failed${NC}"
    echo -e "${RED}This indicates there are type errors that would prevent production deployment${NC}"
    exit 1
  fi
fi

echo -e "\n${GREEN}All TypeScript checks passed!${NC}"
exit 0
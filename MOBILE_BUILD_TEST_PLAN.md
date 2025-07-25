# Rishi Platform Mobile Build: Comprehensive Iterative Test Plan

## Current Facts
✅ **VoltBuilder Works**: Confirmed working with HTML, JavaScript, and React test builds
❌ **Full App Fails**: 71MB Rishi Platform build not working on device
🎯 **Goal**: Identify exact failure point between simple React and full Rishi app

## Systematic Test Progression

### Phase 1: Foundation Tests (COMPLETED)
- [x] Test 1: Basic HTML - **WORKS**
- [x] Test 2: HTML + JavaScript - **WORKS**  
- [x] Test 3: React with state - **WORKS**

### Phase 2: Progressive Complexity Tests (TO DO)

#### Test 4: React + Routing
- Add React Router to working React build
- Single page → Multi-page navigation
- **Purpose**: Test if routing breaks mobile

#### Test 5: React + Capacitor Core
- Add minimal Capacitor integration to React
- Test native bridge communication
- **Purpose**: Isolate Capacitor integration issues

#### Test 6: React + Next.js Runtime
- Create minimal Next.js app (no SSR, just client)
- Single page with Next.js components
- **Purpose**: Test Next.js mobile compatibility

#### Test 7: Next.js + Multiple Pages
- Add 3-4 pages with Next.js routing
- Test navigation between pages
- **Purpose**: Identify routing issues

#### Test 8: Next.js + Tailwind CSS
- Add Tailwind CSS to minimal Next.js
- Test styling system compatibility
- **Purpose**: Check CSS processing issues

#### Test 9: Next.js + Authentication UI
- Add login form (no backend)
- Test form components
- **Purpose**: Check complex UI rendering

#### Test 10: Next.js + API Mocking
- Add mock API responses
- Test data fetching patterns
- **Purpose**: Identify data layer issues

### Phase 3: Feature Integration Tests

#### Test 11: Add Shadcn Components
- Integrate core UI components
- Test component library compatibility

#### Test 12: Add State Management
- Add React Context/Zustand
- Test state persistence

#### Test 13: Add Google Maps
- Integrate maps component
- Test third-party libraries

#### Test 14: Add Full UI Shell
- Complete navigation structure
- Test full UI complexity

### Phase 4: Backend Integration

#### Test 15: Add API Configuration
- Environment variables
- API endpoint configuration

#### Test 16: Add Authentication Flow
- Complete auth integration
- Test secure routes

### Failure Analysis Protocol

For each test that fails:
1. **Error Type**: Blank screen, crash, specific error
2. **Console Logs**: Device console output
3. **Build Differences**: What changed from last working test
4. **Hypothesis**: Why this specific addition caused failure
5. **Fix Strategy**: How to work around the issue

## Implementation Strategy

1. **Rapid Iteration**: Each test builds in 5 minutes or less
2. **Clear Naming**: test-04-react-routing.zip, test-05-capacitor.zip, etc.
3. **Size Tracking**: Monitor build size increase at each step
4. **Automated Building**: Script to generate each test level

## Success Criteria

- Identify exact component/library causing mobile failure
- Document workaround or fix for that component
- Build working full app with necessary modifications

## Timeline

- 5 minutes per test build
- 15 tests = 75 minutes total
- Plus analysis time = ~90 minutes to solution
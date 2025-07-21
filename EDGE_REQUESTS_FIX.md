# Edge Request Optimization - Fixed Excessive Vercel Usage

## Problem Summary
Your app was burning through Vercel Hobby tier allocation in just 3 days due to excessive edge requests. The `/[...slug]` route was hit 12K times, indicating aggressive background polling.

## Root Causes Identified & Fixed

### 1. Service Worker (Critical Fix) ✅
**Problem**: Aggressive pre-caching and request interception
- Pre-cached 30+ static assets and 20+ API endpoints on every install
- Intercepted ALL `/api/` requests causing duplicates
- Stale-while-revalidate strategy making background requests
- Non-existent routes falling through to `/[...slug]`

**Fix**: Replaced with minimal service worker
- Only caches 3 essential assets (`manifest.json`, `favicon.ico`, `rishi-logo-new.svg`)
- No API request interception
- No aggressive pre-caching
- Removed background request mechanisms

### 2. Health Dashboard Polling ✅
**Problem**: ServiceHealthDashboard polling every 30 seconds = 2,880 requests/day

**Fix**: Disabled automatic polling
```javascript
// Before: setInterval(fetchHealth, 30000)
// After: Manual refresh only
```

### 3. WebSocket Ping Intervals ✅
**Problem**: WebSocket pings every 30 seconds = 2,880 requests/day

**Fix**: Disabled aggressive pings
```javascript
// Before: setInterval(ping, 30000)
// After: Rely on natural activity to keep connection alive
```

### 4. Health Monitor Service ✅
**Problem**: Continuous monitoring with 30-second intervals

**Fix**: Disabled automatic monitoring in production
- Changed default interval from 30 seconds to 5 minutes
- Disabled startMonitoring() entirely to prevent background requests

### 5. Event Bus Monitoring ✅
**Problem**: Circuit breaker monitoring every 60 seconds

**Fix**: Disabled timer-based monitoring
- Changed from interval-based to event-driven monitoring
- No more background polling of circuit breaker state

### 6. Service Health Monitor ✅
**Problem**: Health checks every 30 seconds across multiple services

**Fix**: Increased intervals from 30 seconds to 5 minutes (10x reduction)

## Impact Estimate

**Before**: 
- Service Worker: ~5,000+ requests/day (pre-caching + background updates)
- Health Dashboard: 2,880 requests/day
- WebSocket Pings: 2,880 requests/day  
- Health Monitor: 2,880 requests/day
- Event Bus Monitor: 1,440 requests/day
- **Total**: ~15,000+ requests/day from background services alone

**After**:
- Service Worker: ~50 requests/day (essential assets only)
- Health Dashboard: 0 requests/day (manual only)
- WebSocket Pings: 0 requests/day
- Health Monitor: 0 requests/day (disabled)
- Event Bus Monitor: 0 requests/day (event-driven)
- **Total**: ~50 requests/day from background services

## Deployment Notes

1. **Clear Browser Cache**: Users should clear cache/hard refresh to get new service worker
2. **Monitor Edge Requests**: Watch Vercel dashboard for request patterns
3. **Manual Monitoring**: Health dashboards now require manual refresh
4. **WebSocket Reliability**: Connections rely on natural activity instead of pings

## Future Recommendations

1. **Monitoring Strategy**: Implement event-driven monitoring instead of polling
2. **Service Worker**: Only add caching for critical user-facing assets
3. **Health Checks**: Use on-demand health checks triggered by user actions
4. **WebSocket Management**: Implement connection pooling and smart reconnection logic
5. **Production vs Development**: Use environment variables to enable monitoring only in development

This fix should reduce your edge requests by 99%+ and keep you well within Hobby tier limits.
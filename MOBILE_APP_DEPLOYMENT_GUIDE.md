# Mobile App Deployment Guide - Rishi Platform

## ✅ **DEPLOYMENT READY: VoltBuilder Mobile Packages**

### **Package Information**
- **Staging Package**: `rishi-mobile-staging-redis-20250729-2251.zip` (3.2M)
- **Production Package**: Available via `./scripts/build-mobile-production-redis.sh`

### **Dual Redis Architecture Integration**

#### **Staging Configuration**
```bash
# Environment: staging
# Redis Provider: Replit Redis Cloud
# Key Prefix: events:staging:*
# Database: 0 (shared with development)
# Event Coordination: Enabled
```

#### **Production Configuration**
```bash
# Environment: production  
# Redis Provider: Upstash (TLS Encrypted)
# Key Prefix: events:production:*
# Database: 0 (dedicated instance)
# Event Coordination: Enabled
```

### **VoltBuilder Deployment Details**

#### **Staging Mobile App**
- **App ID**: `com.rishiplatform.staging`
- **App Name**: "Rishi Platform (Staging)"
- **Backend**: https://rishi-staging.replit.app
- **Database**: Neon staging database
- **Redis**: Replit Redis Cloud with staging key prefix
- **SDK Configuration**: Target 33, Compile 34

#### **Production Mobile App**
- **App ID**: `com.rishiplatform.app`
- **App Name**: "Rishi Platform"
- **Backend**: https://rishi-platform.vercel.app
- **Database**: Neon production database  
- **Redis**: Upstash Redis with production key prefix
- **SDK Configuration**: Target 33, Compile 34

### **Architecture Benefits**

🎯 **Environment Isolation**
- Complete separation between staging and production
- Key-prefix based Redis isolation prevents data contamination
- Independent backend API endpoints

🔒 **Security**
- Production uses TLS-encrypted Upstash Redis
- Staging uses cost-effective Replit Redis Cloud
- No cross-environment data access possible

⚡ **Performance**
- Real-time event coordination through Redis pub/sub
- Mobile apps stay synchronized with backend changes
- Offline support with data synchronization

🚀 **Scalability**
- Supports unlimited mobile app instances
- Cross-service event distribution
- Multi-instance backend coordination

### **Deployment Steps**

#### **1. VoltBuilder Upload**
1. Go to https://voltbuilder.com/
2. Upload `rishi-mobile-staging-redis-20250729-2251.zip`
3. Configure VoltBuilder settings:
   - **Platform**: Android/iOS
   - **App ID**: `com.rishiplatform.staging`
   - **App Name**: "Rishi Platform (Staging)"

#### **2. Android Configuration**
- **Min SDK**: 26 (Android 8.0)
- **Target SDK**: 33 (Android 13)
- **Compile SDK**: 34 (Android 14)
- **Gradle**: 8.9 with Java 21 compatibility
- **AndroidX**: Latest versions for Capacitor 7.4.2

#### **3. iOS Configuration**
- **iOS Version**: 13.0+
- **Xcode**: Latest supported version
- **Swift**: 5.0+
- **Capacitor**: 7.4.2 with iOS plugins

### **Event Coordination Features**

#### **Real-Time Synchronization**
- Booking updates synchronized across all mobile instances
- Staff availability changes propagated instantly
- Location updates coordinated through Redis channels

#### **Cross-Service Communication**
- Mobile app ↔ Backend API event coordination
- Multi-user collaboration with real-time updates
- Distributed event processing with correlation IDs

#### **Offline Support**
- Mobile apps cache critical data for offline operation
- Event queue synchronization when connectivity restored
- Graceful degradation with local event processing

### **Testing & Verification**

#### **Redis Connection Testing**
```bash
# Test staging Redis connection
node scripts/test-corrected-redis-architecture.js
```

#### **Mobile App Testing**
1. **Staging**: Test with staging backend and Redis
2. **Production**: Test with production Vercel and Upstash
3. **Cross-Platform**: Verify Android and iOS functionality
4. **Event Coordination**: Test real-time updates between mobile and web

### **Production Deployment**

#### **Create Production Package**
```bash
./scripts/build-mobile-production-redis.sh
```

#### **Production Configuration Required**
```bash
# Configure in VoltBuilder or mobile build:
KV_URL=rediss://default:token@picked-ewe-57398.upstash.io:6379
REDIS_URL=rediss://default:token@picked-ewe-57398.upstash.io:6379
DATABASE_URL=your-production-neon-url
```

### **App Store Distribution**

#### **Internal Testing**
- **Android**: Firebase App Distribution
- **iOS**: TestFlight distribution
- **Testing Users**: Internal team and selected clients

#### **Production Release**
- **Android**: Google Play Store
- **iOS**: Apple App Store
- **App Categories**: Business, Productivity
- **Target Audience**: Cannabis industry professionals

### **Monitoring & Analytics**

#### **Redis Event Monitoring**
- Event coordination health checks
- Cross-service communication metrics  
- Mobile app synchronization tracking

#### **Mobile App Analytics**
- User engagement tracking
- Feature usage analytics
- Performance monitoring
- Crash reporting integration

## **Summary**

The Rishi Platform mobile deployment architecture provides:

✅ **Dual Redis event coordination** with environment isolation  
✅ **VoltBuilder-ready packages** for Android/iOS compilation  
✅ **Complete environment separation** (staging vs production)  
✅ **Real-time synchronization** between mobile and web platforms  
✅ **Scalable architecture** supporting unlimited mobile instances  
✅ **Production-grade security** with TLS encryption and proper isolation  

**Ready for immediate VoltBuilder deployment** with comprehensive Redis event coordination across all Rishi Platform environments.
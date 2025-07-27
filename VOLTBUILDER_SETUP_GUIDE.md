# VoltBuilder Setup Guide - Build iOS & Android Without Mac

## 🎯 VoltBuilder: Your Best Alternative to Appflow

Since Ionic Appflow is discontinued, VoltBuilder is the recommended cloud build service for Capacitor projects.

---

## 🚀 QUICK START

### Step 1: Sign Up
1. Go to: https://voltbuilder.com/
2. Create account (15-day free trial)
3. Choose plan: **Starter ($15/month)** is sufficient

### Step 2: Prepare Your Project
```bash
# Make sure your project is built
npm run build

# Create a zip file of your project
# Include: capacitor.config.ts, package.json, src/, www/, android/, ios/
```

### Step 3: Upload to VoltBuilder
1. **Login to VoltBuilder dashboard**
2. **Click "New Project"**
3. **Upload your project zip file**
4. **Configure build settings**:
   - Platform: iOS and/or Android
   - Build type: Release
   - Signing: Upload certificates (or let VoltBuilder generate)

### Step 4: Build & Download
1. **Click "Build"** (takes 5-10 minutes)
2. **Download APK/IPA** when complete
3. **Distribute directly** to users

---

## 📋 WHAT YOU NEED

### For Android:
- Nothing extra (VoltBuilder handles signing)
- Or upload your own keystore

### For iOS:
- Apple Developer account ($99/year)
- iOS certificate and provisioning profile
- Or let VoltBuilder generate development certificates

---

## 💰 PRICING

| Plan | Cost | Features |
|------|------|----------|
| **Starter** | $15/month | Unlimited builds, both platforms |
| **Professional** | $30/month | Priority builds, more storage |
| **Enterprise** | Custom | White-label, dedicated support |

---

## 🔧 VOLTBUILDER ADVANTAGES

### vs. Appflow:
- **Available**: New signups accepted
- **Cheaper**: $15/month vs $29+ for Appflow
- **Simpler**: Just upload zip, get APK/IPA
- **No vendor lock-in**: Works with any Capacitor project

### vs. GitHub Actions:
- **No setup**: No workflow files needed
- **Visual interface**: Easy to use dashboard
- **Handles signing**: Certificate management included
- **Faster**: Dedicated build servers

---

## 📱 DISTRIBUTION AFTER BUILD

### Android APK:
1. **Host the APK** on your server or cloud storage
2. **Share direct download link** with users
3. **Users enable "Unknown Sources"** and install
4. **Or use Firebase App Distribution** for organized delivery

### iOS IPA:
1. **TestFlight** (free, up to 10,000 testers)
2. **Apple Enterprise Program** ($299/year for true sideloading)
3. **Apple Business Manager** (for organizations)

---

## 🎯 RECOMMENDED WORKFLOW

### Phase 1: PWA (Immediate)
- Users install from browser (already works)
- Zero cost, instant distribution

### Phase 2: Native Builds (If needed)
- Use VoltBuilder for cloud builds
- Distribute via Firebase App Distribution
- Cost: $15/month

### Phase 3: Enterprise iOS (If required)
- Add Apple Enterprise Program
- Total cost: $15/month + $299/year

---

## 🔧 SETUP CHECKLIST

- [ ] VoltBuilder account created
- [ ] Project zip file prepared
- [ ] Apple Developer account (for iOS)
- [ ] Test build completed
- [ ] Distribution method chosen
- [ ] User installation tested

This gives you the same capabilities as Appflow at a lower cost with no sunset date concerns.
# VoltBuilder + Firebase Setup - Complete Guide

## 🎯 Goal: Build iOS & Android apps with VoltBuilder, distribute via Firebase

This guide will get you set up with cloud builds and organized distribution for both platforms.

---

## 📋 PREPARATION STEPS

### Step 1: Prepare Your Project Package
```bash
# Build your web app
npm run build

# Create project package for VoltBuilder
npm run package:voltbuilder
```

### Step 2: Required Accounts
- **VoltBuilder**: https://voltbuilder.com/ (15-day free trial)
- **Firebase**: https://firebase.google.com/ (free tier)
- **Apple Developer**: https://developer.apple.com/ ($99/year - for iOS)

---

## 🔧 VOLTBUILDER SETUP

### Step 1: Create VoltBuilder Account
1. Go to https://voltbuilder.com/
2. Sign up for free trial (15 days)
3. Choose **Starter Plan** ($15/month after trial)

### Step 2: Project Configuration
1. **Create New Project** in VoltBuilder dashboard
2. **Upload your project** (zip file with all Capacitor files)
3. **Configure build settings**:
   - **App Name**: Rishi Platform
   - **Bundle ID**: com.rishi.platform
   - **Platforms**: iOS + Android
   - **Build Type**: Release

### Step 3: Certificates & Signing
**For Android:**
- VoltBuilder handles signing automatically
- Or upload your own keystore

**For iOS:**
- Upload Apple Developer certificates
- Or let VoltBuilder generate development certificates

### Step 4: Build Process
1. **Click "Build"** (takes 5-10 minutes)
2. **Download APK** (Android) and **IPA** (iOS) files
3. **Test installation** on devices

---

## 🔥 FIREBASE APP DISTRIBUTION SETUP

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. **Create new project**: "Rishi Platform Distribution"
3. **Enable App Distribution** in console

### Step 2: Upload Your Apps
1. **Go to App Distribution** in Firebase console
2. **Upload APK file** (Android)
3. **Upload IPA file** (iOS)
4. **Add release notes** for each version

### Step 3: Invite Testers
1. **Add tester groups**: "iOS Users", "Android Users"
2. **Add email addresses** of your users
3. **Send invitations** with download links

### Step 4: Distribution Process
1. **Testers receive email** with download links
2. **Android users**: Direct APK install (enable Unknown Sources)
3. **iOS users**: Install via TestFlight-style process

---

## 📱 DISTRIBUTION WORKFLOW

### For Each App Update:
1. **Update your code** in Replit
2. **Build in VoltBuilder** (5-10 minutes)
3. **Upload to Firebase** App Distribution
4. **Notify users** via Firebase (automatic emails)

### User Installation:
**Android:**
1. Receive email from Firebase
2. Click download link
3. Enable "Unknown Sources" if prompted
4. Install APK

**iOS:**
1. Receive email from Firebase
2. Click install link
3. Install via mobile device management profile
4. App appears on home screen

---

## 💰 TOTAL COSTS

| Service | Cost | Purpose |
|---------|------|---------|
| VoltBuilder | $15/month | Cloud builds |
| Firebase | Free | App distribution |
| Apple Developer | $99/year | iOS certificates |
| **Total** | **$15/month + $99/year** | **Complete solution** |

---

## 🎯 AUTOMATION SCRIPT

I'll create a script that automates the entire process:
1. Build your app
2. Package for VoltBuilder
3. Upload to Firebase
4. Notify users

---

## 🔧 NEXT STEPS CHECKLIST

- [ ] VoltBuilder account created
- [ ] Firebase project created
- [ ] Apple Developer account (for iOS)
- [ ] First build completed
- [ ] Test users invited
- [ ] Installation tested on both platforms

This setup gives you professional app distribution without app stores at minimal cost.
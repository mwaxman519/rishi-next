# Quick Start: VoltBuilder + Firebase Setup

## 🚀 Let's Get Your Mobile Apps Built and Distributed!

Here's your complete step-by-step process:

---

## STEP 1: Create VoltBuilder Package (5 minutes)

```bash
# Build your web app
npm run build

# Package for VoltBuilder
node scripts/package-for-voltbuilder.js
```

This creates a zip file ready for VoltBuilder upload.

---

## STEP 2: VoltBuilder Setup (10 minutes)

### 2.1 Create Account
1. Go to https://voltbuilder.com/
2. Sign up (15-day free trial)
3. Choose **Starter Plan** ($15/month)

### 2.2 Create Project
1. **New Project** in dashboard
2. **Upload** your zip file (created in Step 1)
3. **Configure settings**:
   - App Name: `Rishi Platform`
   - Bundle ID: `com.rishi.platform`
   - Platforms: `iOS + Android`
   - Build Type: `Release`

### 2.3 Build Apps
1. **Click "Build"** (takes 5-10 minutes)
2. **Download APK** (Android) and **IPA** (iOS)
3. **Test** on devices

---

## STEP 3: Firebase Distribution Setup (10 minutes)

### 3.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. **Create project**: "Rishi Platform"
3. **Enable App Distribution**

### 3.2 Add Your Apps
1. **Click "Add app"** for Android
2. **Upload APK** file from VoltBuilder
3. **Click "Add app"** for iOS
4. **Upload IPA** file from VoltBuilder

### 3.3 Invite Testers
1. **Create tester groups**: "iOS Users", "Android Users"
2. **Add email addresses** of your users
3. **Send invitations**

---

## STEP 4: User Installation Process

### Android Users:
1. **Receive email** from Firebase
2. **Click download link**
3. **Enable "Unknown Sources"** (if prompted)
4. **Install APK**

### iOS Users:
1. **Receive email** from Firebase
2. **Click install link**
3. **Install via profile** (like TestFlight)
4. **App appears** on home screen

---

## 🎯 AUTOMATION COMMANDS

### Package for VoltBuilder:
```bash
node scripts/package-for-voltbuilder.js
```

### Setup Firebase CLI:
```bash
node scripts/firebase-distribution.js
```

### Upload to Firebase:
```bash
node scripts/firebase-distribution.js upload path/to/app.apk path/to/app.ipa
```

---

## 📋 ACCOUNTS YOU NEED

- [x] VoltBuilder account (15-day free trial)
- [x] Firebase account (free)
- [ ] Apple Developer account ($99/year - for iOS)

---

## 💰 TOTAL COST

- **VoltBuilder**: $15/month
- **Firebase**: Free
- **Apple Developer**: $99/year (iOS only)
- **Total**: $15/month + $99/year

---

## 🔄 UPDATE WORKFLOW

For each app update:
1. **Update code** in your project
2. **Run**: `npm run build`
3. **Package**: `node scripts/package-for-voltbuilder.js`
4. **Upload** to VoltBuilder
5. **Build** new APK/IPA
6. **Upload** to Firebase
7. **Users get notification** and update

---

## ✅ SUCCESS CHECKLIST

- [ ] VoltBuilder package created
- [ ] VoltBuilder account setup
- [ ] First build completed
- [ ] Firebase project created
- [ ] APK/IPA uploaded to Firebase
- [ ] Test users invited
- [ ] Installation tested on both platforms

Ready to start? Let's begin with Step 1!
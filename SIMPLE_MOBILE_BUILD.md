# SIMPLE MOBILE BUILD - COPY & PASTE COMMANDS

## 🎯 ANDROID (Windows/Mac/Linux)

### 1. Install Android Studio
- Download: https://developer.android.com/studio
- Install it (takes 10-15 minutes)

### 2. Run These Commands (Copy & Paste)
```bash
npm run build
npx cap sync
npx cap open android
```

### 3. In Android Studio (When It Opens)
1. **Wait 2-3 minutes** for sync
2. **Build** → **Generate Signed Bundle / APK**
3. **Choose APK** → **Next**
4. **Create new keystore** (any password/name)
5. **Select release** → **Finish**
6. **Wait 2-3 minutes**

### 4. Get Your APK
- File location: `android/app/build/outputs/apk/release/app-release.apk`
- This file installs on Android phones

---

## 🍎 iOS (Mac Only)

### 1. Install Xcode
- Mac App Store → Search "Xcode" → Get (free, 10+ GB)

### 2. Run These Commands (Copy & Paste)
```bash
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

### 3. In Xcode (When It Opens)
1. **Wait 2-3 minutes** for indexing
2. **Product** → **Archive**
3. **Wait 3-5 minutes** for archive
4. **Distribute App** → **Custom** → **Development**
5. **Export** → Choose folder → **Export**

### 4. Get Your IPA
- File location: Whatever folder you chose
- Look for "Rishi Platform.ipa"
- This file installs on iPhones/iPads

---

## 🚨 TROUBLESHOOTING

**Problem:** "Build failed"
**Solution:** Run `npm run build` first

**Problem:** "No Android SDK"
**Solution:** Reinstall Android Studio

**Problem:** "Can't find index.html"
**Solution:** Run `npm run build` again

**Problem:** Commands don't work
**Solution:** Make sure you're in your project folder

---

## ✅ SUCCESS = YOU GET THESE FILES:

- **Android**: `app-release.apk` (10-20 MB)
- **iOS**: `Rishi Platform.ipa` (10-20 MB)

These files can be installed directly on phones!
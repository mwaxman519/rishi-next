#!/bin/bash

# Build Mobile Production Package with Dual Redis Architecture
# Creates VoltBuilder-ready package for Android/iOS compilation

set -e

echo "🏗️  Building Rishi Platform Mobile - Production (with Redis Event Coordination)"
echo "=================================================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf rishi-mobile-production-redis-*.zip
rm -rf mobile-production-redis-build/

# Create build directory
mkdir -p mobile-production-redis-build
cd mobile-production-redis-build

echo "📋 Copying project files..."

# Copy core application files
cp -r ../app ./
cp -r ../components ./
cp -r ../contexts ./
cp -r ../hooks ./
cp -r ../lib ./
cp -r ../public ./
cp -r ../server ./
cp -r ../services ./
cp -r ../shared ./
cp -r ../styles ./
cp -r ../types ./

# Copy configuration files
cp ../next.config.mjs ./
cp ../tailwind.config.js ./
cp ../tsconfig.json ./
cp ../package.json ./
cp ../.gitignore ./

# Copy Capacitor configuration
cp ../capacitor.config.ts ./

echo "🔧 Configuring for production environment with Redis..."

# Create production environment file (placeholder - user will configure)
cat > .env.production << 'EOF'
# Production Mobile Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Production Database (configure with actual production URL)
# DATABASE_URL=postgresql://production-database-url

# Production Redis (Upstash - TLS Encrypted)
ENABLE_REDIS_EVENTS=true
# Configure these with actual Upstash credentials:
# KV_URL=rediss://default:token@picked-ewe-57398.upstash.io:6379
# REDIS_URL=rediss://default:token@picked-ewe-57398.upstash.io:6379
# KV_REST_API_URL=https://picked-ewe-57398.upstash.io
# KV_REST_API_TOKEN=your-token

# Mobile-specific settings
NEXT_PUBLIC_VERCEL_URL=https://rishi-platform.vercel.app
NEXT_PUBLIC_API_URL=https://rishi-platform.vercel.app/api
NEXT_PUBLIC_MOBILE_MODE=true
EOF

# Update Next.js config for mobile static export
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor mobile wrapper
  output: 'export',
  trailingSlash: true,
  
  // Mobile optimizations
  images: {
    unoptimized: true
  },
  
  // Environment-specific configuration
  env: {
    NEXT_PUBLIC_MOBILE_MODE: 'true',
    ENABLE_REDIS_EVENTS: 'true'
  },
  
  // Capacitor compatibility
  assetPrefix: './',
  
  // Disable features not supported in static export
  generateBuildId: () => 'production-mobile-build',
  
  // Webpack configuration for mobile
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Experimental features for mobile
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
EOF

# Update Capacitor config for production
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.app',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    // Production: Static files + Live Vercel API
    url: 'https://rishi-platform.vercel.app',
    cleartext: false
  },
  plugins: {
    App: {
      launchShowDuration: 2000
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7c3aed",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#7c3aed"
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    },
    LocalNotifications: {
      iconColor: "#7c3aed"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
EOF

# Create Android directory structure
echo "📱 Creating Android project structure..."
mkdir -p android
mkdir -p android/app
mkdir -p android/app/src
mkdir -p android/app/src/main
mkdir -p android/app/src/main/assets
mkdir -p android/app/src/main/java
mkdir -p android/app/src/main/res
mkdir -p android/gradle
mkdir -p android/gradle/wrapper

# Create Android build.gradle
cat > android/build.gradle << 'EOF'
buildscript {
    ext {
        minSdkVersion = 26
        compileSdkVersion = 34
        targetSdkVersion = 33
        androidxActivityVersion = '1.9.2'
        androidxAppCompatVersion = '1.7.0'
        androidxCoordinatorLayoutVersion = '1.2.0'
        androidxCoreVersion = '1.15.0'
        androidxFragmentVersion = '1.8.5'
        coreSplashScreenVersion = '1.0.1'
        androidxWebkitVersion = '1.12.1'
        junitVersion = '4.13.2'
        androidxJunitVersion = '1.2.1'
        androidxEspressoCoreVersion = '3.6.1'
        cordovaAndroidVersion = '13.0.0'
    }
    
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
EOF

# Create app-level build.gradle
cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace 'com.rishiplatform.app'
    compileSdk rootProject.ext.compileSdkVersion
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
    
    defaultConfig {
        applicationId "com.rishiplatform.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.core:core:$androidxCoreVersion"
    implementation "androidx.activity:activity:$androidxActivityVersion"
    implementation "androidx.fragment:fragment:$androidxFragmentVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.webkit:webkit:$androidxWebkitVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-app')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-local-notifications')
    implementation project(':capacitor-push-notifications')
    implementation project(':capacitor-splash-screen')
    implementation project(':capacitor-status-bar')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
EOF

# Create settings.gradle
cat > android/settings.gradle << 'EOF'
include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('./capacitor-android/')

include ':capacitor-app'
project(':capacitor-app').projectDir = new File('./capacitor-app/')

include ':capacitor-keyboard'
project(':capacitor-keyboard').projectDir = new File('./capacitor-keyboard/')

include ':capacitor-local-notifications'
project(':capacitor-local-notifications').projectDir = new File('./capacitor-local-notifications/')

include ':capacitor-push-notifications'
project(':capacitor-push-notifications').projectDir = new File('./capacitor-push-notifications/')

include ':capacitor-splash-screen'
project(':capacitor-splash-screen').projectDir = new File('./capacitor-splash-screen/')

include ':capacitor-status-bar'
project(':capacitor-status-bar').projectDir = new File('./capacitor-status-bar/')
EOF

# Create gradle.properties
cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
kotlin.jvm.target.validation.mode=warning
android.defaults.buildfeatures.buildconfig=true
android.nonTransitiveRClass=false
android.nonFinalResIds=false
EOF

# Create Gradle wrapper
echo "⚙️ Setting up Gradle wrapper..."

# Create gradlew executable
cat > android/gradlew << 'EOF'
#!/bin/sh

DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
GRADLE_OPTS=""
JAVA_OPTS=""

APP_NAME="Gradle"
APP_BASE_NAME=`basename "$0"`

GRADLE_USER_HOME=${GRADLE_USER_HOME:-$HOME/.gradle}

warn() {
    echo "$*"
} >&2

die() {
    echo
    echo "$*"
    echo
    exit 1
} >&2

case "`uname`" in
  CYGWIN* | MINGW* )
    cygwin=true
    ;;
esac

GRADLE_APP_DIR=`pwd -P`

CLASSPATH=$GRADLE_APP_DIR/gradle/wrapper/gradle-wrapper.jar

exec "$JAVACMD" $DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS "\"-Dorg.gradle.appname=$APP_BASE_NAME\"" -classpath "\"$CLASSPATH\"" org.gradle.wrapper.GradleWrapperMain "$@"
EOF

chmod +x android/gradlew

# Create gradle-wrapper.properties
cat > android/gradle/wrapper/gradle-wrapper.properties << 'EOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.9-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF

# Create placeholder for gradle-wrapper.jar (VoltBuilder will replace this)
echo "placeholder-gradle-wrapper-jar" > android/gradle/wrapper/gradle-wrapper.jar

echo "📦 Creating final VoltBuilder package..."
cd ..

# Create the final package
PACKAGE_NAME="rishi-mobile-production-redis-$(date +%Y%m%d-%H%M).zip"
zip -r "$PACKAGE_NAME" mobile-production-redis-build/ \
  -x "mobile-production-redis-build/node_modules/*" \
  -x "mobile-production-redis-build/.next/*" \
  -x "mobile-production-redis-build/.git/*" \
  -x "*.DS_Store" \
  -x "*.log"

PACKAGE_SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)

echo ""
echo "✅ Mobile production package created successfully!"
echo "📦 Package: $PACKAGE_NAME"
echo "📏 Size: $PACKAGE_SIZE"
echo ""
echo "🏗️  Redis Architecture Configuration:"
echo "   • Environment: production"
echo "   • Redis Provider: Upstash (TLS Encrypted)"
echo "   • Key Prefix: events:production:*"
echo "   • Database: 0 (dedicated instance)"
echo "   • Event Coordination: Enabled"
echo ""
echo "🚀 VoltBuilder Deployment:"
echo "   • App ID: com.rishiplatform.app"
echo "   • Backend: https://rishi-platform.vercel.app"
echo "   • SDK Target: 33 (Android 13)"
echo "   • Compile SDK: 34 (Android 14)"
echo "   • Redis Events: Enabled with production prefix"
echo ""
echo "📱 Ready for upload to https://voltbuilder.com/"
echo ""
echo "⚠️  IMPORTANT: Configure production Redis credentials before deployment:"
echo "   • KV_URL: Your Upstash Redis URL"
echo "   • REDIS_URL: Same as KV_URL"
echo "   • KV_REST_API_URL: Your Upstash REST API URL"
echo "   • KV_REST_API_TOKEN: Your Upstash token"

# Cleanup
rm -rf mobile-production-redis-build/

echo "🎉 Production mobile build with Redis event coordination complete!"
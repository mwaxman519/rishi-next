# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor rules
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.rishiplatform.app.** { *; }

# Keep native methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Equb Draw (እቁብ ዕጣ)

A provably fair lottery and ledger app for Ethiopian Equb rotating savings groups, prepared for deployment both as a web app and an Android APK via Capacitor 7.

---

## Build the APK

This application is configured with **Capacitor 7** and optimized for older and low-end Android WebViews (Android 6.0+, API 23+, Chrome/WebView 60+), including devices like the Samsung Galaxy Tab A 10.1 (SM-T580) and Samsung Galaxy A02 / A2 Core (1 GB RAM Android Go).

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or v22 recommended)
- [Android Studio](https://developer.android.com/studio) (Ladybug or newer)
- Android SDK Platform 34 or 35 installed with Android SDK Build-Tools

### Step 1: Install Dependencies & Build Web Assets
```bash
# Install packages
npm install --legacy-peer-deps

# Build production static bundle
npm run build
```

### Step 2: Initialize / Sync Android Project with Capacitor
```bash
# Add Android platform if not yet added
npx cap add android

# Build and sync web bundle into native android folder
npm run build:android
```

> **IMPORTANT**:
> Open `android/variables.gradle` and ensure that `minSdkVersion` is pinned to **23** (Android 6.0):
> ```gradle
> ext {
>     minSdkVersion = 23
>     compileSdkVersion = 34
>     targetSdkVersion = 34
>     androidxActivityVersion = '1.8.0'
>     androidxAppCompatVersion = '1.6.1'
>     androidxCoordinatorLayoutVersion = '1.2.0'
>     androidxCoreVersion = '1.12.0'
>     androidxFragmentVersion = '1.6.2'
>     coreSplashScreenVersion = '1.0.1'
>     androidxWebkitVersion = '1.9.0'
>     junitVersion = '4.13.2'
>     androidxJunitVersion = '1.1.5'
>     androidxEspressoCoreVersion = '3.5.1'
>     cordovaAndroidVersion = '10.1.1'
> }
> ```
> Keeping `minSdkVersion = 23` ensures compatibility with Android 6.0+ devices.

### Step 3: Open in Android Studio & Generate APK
```bash
# Open Android project in Android Studio
npx cap open android
```

1. In Android Studio, wait for Gradle sync to complete.
2. Go to **Build** menu > **Build Bundle(s) / APK(s)** > **Build APK(s)** (or **Generate Signed Bundle / APK** for release).
3. The compiled APK will be located in:
   `android/app/build/outputs/apk/debug/app-debug.apk` (or `release/app-release.apk`).

---

## Low-End & Legacy WebView Optimizations
- **Target Target**: Vite `build.target: "es2015"` with `@vitejs/plugin-legacy` targeting `["chrome >= 60", "android >= 6"]` with core-js polyfills.
- **Tailwind CSS v3**: Uses Tailwind CSS v3 and PostCSS with Autoprefixer instead of Tailwind v4, ensuring compatibility with WebViews lacking CSS nesting or `@layer`.
- **Memory Footprint (1GB RAM)**: Initial JS bundle under 300KB gzipped; heavier screens (Verify, History, Settings) are lazy-loaded via `React.lazy()`.
- **Hardware Back Button**: Handled via `@capacitor/app` with a graceful confirmation modal on the Groups home screen before exiting.
- **Offline Fonts**: Built-in system Ethiopic font stacks (`Noto Sans Ethiopic`, `Abyssinica SIL`) with zero external font network blocking.
- **Firestore Cache**: 10MB client cache limit configured to prevent memory pressure on Android Go.
- **Native Share & Status Bar**: Deep green status bar (`#0E3B2E`) and native `@capacitor/share` integration.

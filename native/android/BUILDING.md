# Android APK build

Requires Java 17, an Android SDK, Android SDK licenses, build-tools 36.0.0,
platform 36, NDK 27.1.12297006 and CMake 3.22.1. Set JAVA_HOME and ANDROID_HOME
for your own machine.

Install JavaScript dependencies in `native` using `npm ci`.
The committed Android project includes the neon launcher icon, minSdk 26,
version 1.1.0 (code 2), and ARM64/ARMv7 ABI filters.
Do not regenerate it with Expo prebuild unless you preserve those native changes.

The test build uses the standard development signing configuration. Generate
a development key locally if none exists (this is not a production signing key):

```sh
cd native/android
keytool -genkeypair -v -storetype JKS -keystore app/debug.keystore \
  -storepass android -alias androiddebugkey -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
NODE_ENV=production ./gradlew :app:assembleRelease \
  -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
```

The APK is created at `app/build/outputs/apk/release/app-release.apk`.
For production distribution, supply your own protected signing key and signing
configuration. Never commit private signing keys. A new development key will
not update an installation signed by a different development key.

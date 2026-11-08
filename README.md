# AV Player

[Download the latest Android APK](https://github.com/salilsen056-svg/AV-player/releases/latest) · [Web source](web/) · [Android source](native/)

React + Video.js web player and React Native + LibVLC mobile player, inspired by the supplied VLC screenshots. Includes a custom SVG AV/play monogram.

## Run the web player

```sh
cd web
npm install
npm run setup:ffmpeg
npm run dev
```

In another terminal in `web`, run `npm run server` to enable local conversion. Open the Vite URL. If browser playback fails for a local file, choose **Convert with local FFmpeg**. The original file stays unchanged. Conversion runs locally, creates H.264 video/AAC audio MP4, and deletes temporary server files after delivery. The converted copy is kept in browser memory for this session. Limit: 2 GB, one conversion at a time, ten minute timeout. The development proxy is configured; deployed web hosting would need a separately secured conversion service. No URL-based server fetching is implemented.

Controls: brightness 25–200% (video image only), volume 0–100%, rewind/forward 10 seconds, playback speed, native Video.js fullscreen and picture-in-picture. Library file selection, drag/drop, search, list/grid views, playlists, URL streams, recent plays and resume positions are implemented. Artist/album/genre indexing is not implemented. Local files must be selected again after refreshing. Playlist names, IDs, history and positions persist in browser storage; native app collections currently last for the session. Stream URLs are stored locally, so avoid saving secret-bearing URLs on shared devices.

## Run the mobile app

```sh
cd native
npm install
npx expo install --check
npm run android
# or, with a working Xcode + CocoaPods setup:
npm run ios
```

Requires a custom native build. Expo Go cannot load LibVLC. The project uses Expo SDK 54 with the legacy React Native architecture for the VLC bridge. Native integration may require platform-specific work depending on Xcode, Gradle and the installed VLC package; consult the upstream integration guide. Includes native screen brightness (restored on close), volume, play/pause, scrubber, 10-second jumps and speed controls. File selection uses the system document picker, rather than broad media-library permission. DVD menu navigation, disc mounting and ISO images are not implemented.

## Format support and validation

The native app integrates LibVLC for broader decoder support than browser Video.js. The web app first tries browser playback and offers local FFmpeg conversion on failure. An extension describes a container, not every codec inside it: no universal playback guarantee is made.

Generated one-second video fixtures passed through the actual HTTP conversion endpoint and were decoded successfully for MP4, MKV, AVI, MOV, WMV, FLV, WebM, MPEG, MPG, 3GP, OGV, TS, MTS and VOB. See `format-test-results.json`. These fixtures have video only; they do not establish support for every codec, subtitle, audio track, long file, encrypted media, or DVD structure.

Verified: production web build; browser sample playback; actual brightness/volume slider interactions; forward/reverse jumps of 10 seconds; iOS Metro JavaScript export. Native simulator execution was blocked by unavailable CoreSimulator services, and Android platform tools were not found. Native device playback and brightness remain unverified. A Playwright regression suite is included; automated browser launch was blocked in this environment, so browser controls were checked through the connected Chrome session instead.

## References

- Video.js React lifecycle: https://legacy.videojs.org/guides/react/
- LibVLC React Native integration and supported formats: https://github.com/razorRun/react-native-vlc-media-player
- Custom Expo native builds: https://docs.expo.dev/workflow/customizing/

## Android APK

`../AV-Player-1.0.0.apk` is a self-contained release-mode test APK, signed using the project development certificate. Android 8.0+; ARM64 and ARMv7 phones. No Metro server or Expo Go is needed. Includes the neon AV logo, LibVLC video/MP3 audio, brightness, volume and ten-second seeking. APK signature, ZIP integrity, bundled JavaScript, and LibVLC/Hermes/React Native libraries for both ABIs were verified. No Android device was connected, so native playback and installation have not been tested. This is not a Play Store production signing build. See `apk-build-report.json` and `apk-verification.txt`.

## Video quality — version 1.1.0

Updated APK: `../AV-Player-1.1.0.apk`, versionCode 2, signed with the same development certificate as 1.0.0 so it can be installed as an update.

Both platforms offer Auto, 240p, 360p, 480p, 720p, 1080p, 1440p60 HDR, and 2160p60 HDR. Additional advertised HLS qualities appear too. Open an HLS master `.m3u8` URL to use the selector. Resolutions must exist in the source manifest; unavailable options are disabled. Local/progressive files retain Original quality and are not upscaled or reencoded by this selector. The high HDR presets require VIDEO-RANGE=PQ/HLG and FRAME-RATE of at least 59 (including 59.94 fps) in the source manifest. Device decoder and display support determine actual HDR output. Selecting HDR never converts SDR to HDR. DASH quality switching is not implemented.

Manual selection creates a single-variant HLS master while preserving alternate audio/subtitle groups and resolving their URLs. Auto returns to the original adaptive master. VOD position, play/pause, volume and speed are retained across a switch. Live streams may have different seek windows. Web manifests must allow cross-origin access. Native temporary manifests are removed when playback closes.

Validation: 5 tests for matching resolutions/HDR/frame rates, handling malformed sources, and preserving alternate audio passed. Web playback switched between real generated 240p and 1080p renditions, preserving the paused position. Native release compilation, signed APK integrity, ABI libraries, bundled quality UI, and update certificate match passed. No physical Android playback test or actual HDR output validation was possible.

## Repository layout

- `web/`: React and Video.js browser player, plus optional local FFmpeg service.
- `native/`: React Native/Expo app with LibVLC and the generated Android project.
- `tests/`: quality parsing and selection tests (`node --test tests/quality.test.mjs`).
- `native/android/BUILDING.md`: reproducible APK build and local signing setup.

Dependencies, generated build files, local signing keys, and APK binaries are excluded from Git. Downloadable APKs should be distributed as GitHub Release assets rather than committed to source.

## Android playback fix — version 1.1.1

Fixes a confirmed LibVLC bridge bug: local `file://` URIs were passed to the raw-filesystem-path constructor. URI sources now use the URI constructor, while bare paths retain the path constructor. This also fixes loading temporary local HLS manifests. The patch runs automatically after dependency installation and forwards native setup exceptions to the player UI.

Adds offline video and MP3 checks, playback status, a 20-second startup error, Retry, and a software/hardware decoder toggle. Use the offline checks to separate device decoder problems from network or source-file problems. Signature and build checks do not substitute for an on-device test.

## Android playback stability build — 1.1.2

APK: `../AV-Player-1.1.2.apk`, versionCode 4, same development signing certificate for updates. Uses Expo Video / Android Media3 (ExoPlayer) by default to avoid entering the LibVLC playback path that was reported to close the app. LibVLC remains an explicit compatibility option for uncommon formats. Native player status/errors are forwarded to the UI and a JavaScript error boundary protects the playback screen. Native process crashes cannot be caught by a React error boundary.

Play **Offline video check**, then **Audio → Offline MP3 check** before testing network streams or personal files. Actual resolution of the reported iQOO crash is not confirmed because no device or crash log was available. Default-engine format support is determined by Media3 and device codecs; broad LibVLC format support is not a guarantee for the default engine.

## Android fullscreen — 1.1.3

The Android Media3 player now has an explicit **Fullscreen** button below the video. It opens the existing player in landscape fullscreen with native play/pause and seeking controls; Android Back or the fullscreen exit button returns to the inline view. The same player instance retains position, volume and speed. Fullscreen is disabled for audio-only items. The optional LibVLC compatibility engine does not expose this Media3 fullscreen button. Build and package verification do not confirm runtime behavior on a physical device.

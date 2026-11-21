# Distributing Bugsy.xcframework (DEB-85)

`BugsyReactNative.podspec` needs a real `Bugsy.xcframework` binary to vendor. Two ways to get
that binary from the `bugsy` repo into this one were considered.

## Option A (chosen): zipped asset on the `bugsy` GitHub Release

Each `bugsy` release build (`.github/workflows/release.yml`) also builds
`:ui:assembleBugsyReleaseXCFramework`, zips the result, and uploads it to that same GitHub
Release as `Bugsy.xcframework.zip` — the same pattern already used there for the `bugsy-desktop`
installers.

This package's `postinstall` (`scripts/download-xcframework.js`) downloads that asset for a
pinned `bugsy` version and unzips it into `ios/Frameworks/Bugsy.xcframework`, which the podspec
vendors via `s.vendored_frameworks`.

Why this one: it needed no new infrastructure — `gh release upload` is already how
`bugsy-desktop`'s installers get attached — and it keeps the binary a plain, authenticated-free
HTTPS download, so `pod install` doesn't need any extra credentials or registry config.

## Option B (future): CocoaPods/SPM binary registry (DEB-95)

Publish `Bugsy.xcframework` to a proper binary distribution channel — e.g. as a direct CocoaPods
`:http` source pointing at a stable URL pattern, or as a Swift Package Manager binary target —
instead of a GitHub Release asset fetched by a custom script.

This would drop the need for `postinstall` entirely (CocoaPods/SPM would resolve and cache the
binary themselves) and make the version pin declarative instead of a constant in a JS file. It's
more work to set up (a registry, or restructuring the pod/package manifest), so it's deferred to
DEB-95 rather than blocking this package's first usable iOS build.

## Version pinning

`scripts/download-xcframework.js` currently pins `bugsy`'s version
(`BUGSY_NATIVE_VERSION`) the same way `android/build.gradle`'s `bugsyNativeVersion` does
(DEB-80): a hardcoded constant, bumped by hand, independent of this npm package's own
`package.json` version. Unifying both into a single source of truth — and deciding how that
tracks a release of this npm package — is DEB-94's job.

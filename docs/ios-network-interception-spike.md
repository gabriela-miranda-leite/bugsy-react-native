# iOS network interception spike (DEB-88)

## Question

Does Bugsy's iOS `NSURLProtocol` capture `RCTNetworking`/`fetch()` traffic with zero configuration
on the app's side, or does React Native's networking layer need extra wiring?

## Short answer

**Works with zero extra configuration**, for the default case — which is also React Native's
default case. No follow-up task is needed to make capture work.

## How Bugsy captures network traffic on iOS

`core/src/iosMain/kotlin/com/bugsy/core/UrlProtocolInterceptor.kt` (in the `bugsy` repo) globally
registers an `NSURLProtocol` subclass via `NSURLProtocol.registerClass(...)` when `Bugsy.initialize()`
runs. Per Apple's own documented behavior (and Bugsy's own KDoc/README, which already call this out):

> `registerClass` only affects `URLSession.shared` and sessions created with the **default**
> configuration. Sessions with a custom `NSURLSessionConfiguration` need to include the class in
> `protocolClasses`.

This is also gated by `Platform.isDebugBinary` — release builds (linked against `:bugsy-noop`) never
register the protocol, by design.

## How React Native creates its networking session

Checked `RCTHTTPRequestHandler.mm`'s `sendRequest:withDelegate:` in two versions:

- **RN 0.88.0** (this repo's `example/`, current): uses
  `[NSURLSessionConfiguration defaultSessionConfiguration]` unless the host app explicitly calls
  `RCTSetCustomNSURLSessionConfigurationProvider(...)` — an opt-in hook, not RN's default. No
  `protocolClasses` override anywhere in the file.
- **RN 0.70.0** (older, checked via GitHub): identical pattern — same opt-in provider hook, same
  `defaultSessionConfiguration` fallback, no `protocolClasses` override.

So in both the current and an older RN version, the default networking path uses exactly the kind of
session Bugsy's global registration is documented to intercept. The only way to bypass it is for the
**host app** to register a custom `NSURLSessionConfigurationProvider` — an explicit opt-in on the
app's side, not something RN or a third-party RN library does by default.

## Live validation

Built the `example/` app (New Arch, iOS 26.5 simulator) with a temporary test harness (not committed —
scope of a real test screen in the example app is DEB-90) that called, from JS, in order:

1. `fetch('https://httpbin.org/get')` — plain GET
2. `fetch(..., { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(...) })` — JSON POST
3. `fetch(..., { method: 'POST', body: formData })` with a `FormData` payload (multipart upload)

All three completed successfully (`200` responses), confirmed both in the JS-visible status text and
in the device's unified log (`CFNetwork`/`libboringssl` entries showing real TLS connections and
`200`/`content K` responses) — i.e., real traffic flowed through `URLSession` exactly as RN's
`RCTHTTPRequestHandler` creates it (default configuration).

**What I could not fully confirm visually**: whether these three requests actually show up in
Bugsy's own request list in the overlay UI. Calling `Bugsy.show()` right after crashes the app (see
below) before the overlay renders anything, so I couldn't screenshot the populated list. Given the
code-level evidence above (RN's session matches exactly the "default configuration" case Bugsy's own
docs say gets captured), I'm confident interception itself works — but this is the one part of the
acceptance criteria not visually closed out.

## Blocking discovery: `Bugsy.show()` crashes in this example app (separate from this spike's question)

While setting up the live validation, found and fixed a real pre-existing bug blocking any runtime
test at all: `ios/BugsyReactNative.mm` never called `RCT_EXPORT_MODULE()` (missing since the DEB-76
scaffold) — so `TurboModuleRegistry.getEnforcing('Bugsy')` always failed with "could not be found",
even though the module built successfully (CI only builds, it doesn't run the app). Fixed as part of
this PR; `+ (NSString *)moduleName` is now provided by the macro instead of written out by hand.

With that fixed, `Bugsy.initialize({})` runs fine and all three network calls complete — but
`Bugsy.show()` then crashes the app with `SIGABRT` (`terminateWithUnhandledException`, a Kotlin/Native
uncaught exception) during the overlay's presentation, before anything renders. A screen recording
confirms this: the last visible frame is the test screen's own UI; the next is already back at the
simulator's home screen.

The native `bugsy/sample-ios` app (no React Native, same simulator) calling the equivalent
`Bugsy.shared.initialize(...)` + `BugsyIosOverlayKt.startBugsyIosOverlay()` sequence **does not**
crash — suggesting this is specific to how the overlay locates/presents over the host app's root view
controller in a `UIScene`/`SceneDelegate`-based app (RN 0.88's default template), not a general iOS 26
simulator issue. I have not investigated the `ui/` Kotlin source for this — out of scope for a spike
about network interception — but it's a real blocker for DEB-90 ("[RN] Adicionar tela de teste no
example/") and DEB-91, both of which call `Bugsy.show()` from this same app. Worth a dedicated bug
ticket before picking those up.

## Decision

- No extra RN-side configuration is needed for Bugsy's `NSURLProtocol` to see `fetch()`/JSON/
  multipart traffic — confirmed by code review of both RN versions and by live requests completing
  through the exact code path Bugsy's own docs describe as captured.
- The one caveat, already documented by Bugsy itself and not RN-specific: an app that explicitly
  installs a custom `NSURLSessionConfigurationProvider` (via RN's own opt-in
  `RCTSetCustomNSURLSessionConfigurationProvider` hook) would bypass capture unless it also adds
  Bugsy's protocol class to that configuration's `protocolClasses`. This is a pre-existing,
  already-documented limitation of Bugsy's own interception model — not something to design around
  for this integration.
- Separately found and fixed a real bug (`RCT_EXPORT_MODULE` missing) that blocked any runtime test
  of the iOS module at all.
- Separately found (not fixed — out of scope) a crash in `Bugsy.show()` specific to this RN example
  app, blocking DEB-90/91 until resolved.

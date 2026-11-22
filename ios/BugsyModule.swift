import Bugsy
import Foundation

/// Swift-side business logic for the `Bugsy` TurboModule, mirroring `BugsyReactNativeModule.kt`
/// (DEB-81/DEB-82/DEB-83). The actual `NativeBugsySpec` conformance stays in the Obj-C++
/// `BugsyReactNative` class, since the generated spec protocol uses C++ types
/// (`JS::NativeBugsy::SpecInitializeConfig&`) that Swift can't see — this class only deals in
/// plain types so that thin shim can call into it.
@objc(BugsyModule)
final class BugsyModule: NSObject {
  @objc var onIsVisibleChanged: ((Bool) -> Void)?

  private var isVisibleTask: Task<Void, Never>?

  override init() {
    super.init()
    observeIsVisible()
  }

  @objc func initialize(
    trigger: String?,
    shakeThresholdG: NSNumber?,
    allowRevealingSecrets: NSNumber?,
    environment: String?,
    slowRequestThresholdMs: NSNumber?
  ) {
    let defaults = BugsyConfig.companion
    let config = BugsyConfig(
      trigger: trigger.map(Self.parseTrigger) ?? .shake,
      shakeThresholdG: shakeThresholdG?.floatValue ?? defaults.DEFAULT_SHAKE_THRESHOLD_G,
      flagsProvider: { [] },
      allowRevealingSecrets: allowRevealingSecrets?.boolValue ?? false,
      customInfoProvider: { [] },
      environment: environment,
      slowRequestThresholdMs: slowRequestThresholdMs?.int64Value ?? defaults.DEFAULT_SLOW_REQUEST_THRESHOLD_MS
    )
    Bugsy.shared.initialize(config: config)
    // Makes Bugsy.shared.show()/hide() present/dismiss the overlay from here on; BugsyIosOverlayKt's
    // own doc comment says to call this after Bugsy.initialize(), not before.
    BugsyIosOverlayKt.startBugsyIosOverlay()
  }

  @objc func destroy() {
    Bugsy.shared.destroy()
  }

  @objc func show() {
    Bugsy.shared.show()
  }

  @objc func hide() {
    Bugsy.shared.hide()
  }

  @objc func deviceInfo() -> [String: String] {
    let info = Bugsy.shared.deviceInfo()
    return [
      "appVersionName": info.appVersionName,
      "appVersionCode": info.appVersionCode,
      "environment": info.environment,
      "buildType": info.buildType,
      "deviceModel": info.deviceModel,
      "osName": info.osName,
      "osVersion": info.osVersion,
      "locale": info.locale,
      "bugsyVersion": info.bugsyVersion,
      "kotlinVersion": info.kotlinVersion,
      "composeVersion": info.composeVersion,
    ]
  }

  @objc func addSensitiveHeader(_ name: String) {
    Bugsy.shared.addSensitiveHeader(name: name)
  }

  @objc func removeSensitiveHeader(_ name: String) {
    Bugsy.shared.removeSensitiveHeader(name: name)
  }

  @objc func addSensitiveBodyField(_ name: String) {
    Bugsy.shared.addSensitiveBodyField(name: name)
  }

  @objc func removeSensitiveBodyField(_ name: String) {
    Bugsy.shared.removeSensitiveBodyField(name: name)
  }

  @objc func invalidate() {
    isVisibleTask?.cancel()
    isVisibleTask = nil
  }

  /// Swift can't `collect` a Kotlin `StateFlow` directly (see `BugsyIosOverlayKt`'s own doc
  /// comment on `BUGSY_FLAGS_DID_CHANGE_NOTIFICATION`), so a `ClosureFlowCollector` bridges it.
  private func observeIsVisible() {
    let collector = ClosureFlowCollector { [weak self] value in
      guard let isVisible = (value as? KotlinBoolean)?.boolValue else { return }
      self?.onIsVisibleChanged?(isVisible)
    }
    isVisibleTask = Task { [weak self] in
      guard self != nil else { return }
      try? await Bugsy.shared.isVisible.collect(collector: collector)
    }
  }

  /// Falls back to `Trigger.shake` for a value that doesn't match a `Trigger` member name —
  /// mirrors the Android module's `parseTrigger`.
  private static func parseTrigger(_ value: String) -> Trigger {
    switch value {
    case "Shake": return .shake
    case "FloatingButton": return .floatingbutton
    case "Notification": return .notification
    default: return .shake
    }
  }
}

private final class ClosureFlowCollector: NSObject, Kotlinx_coroutines_coreFlowCollector {
  private let onEach: (Any?) -> Void

  init(onEach: @escaping (Any?) -> Void) {
    self.onEach = onEach
  }

  func emit(value: Any?, completionHandler: @escaping ((any Error)?) -> Void) {
    onEach(value)
    completionHandler(nil)
  }
}

package com.bugsyreactnative

import com.bugsy.core.Bugsy
import com.bugsy.core.BugsyConfig
import com.bugsy.core.Trigger
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Translates the typed JS API (DEB-79) into calls on `object Bugsy` (com.bugsy.core, resolved via
 * Maven — DEB-80). `show`/`hide` delegate to `Bugsy`, whose `isVisible` changes are forwarded to
 * JS as `onIsVisibleChanged` (DEB-82). The overlay Activity that actually renders on `show()`
 * lands in DEB-83.
 */
class BugsyReactNativeModule(reactContext: ReactApplicationContext) :
  NativeBugsySpec(reactContext) {

  private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
  private var isVisibleJob: Job? = null

  // TurboModule's own no-arg lifecycle hook (NativeModule#initialize), not the generated
  // `initialize(ReadableMap)` business method below — this is where the isVisible subscription
  // starts so it's alive regardless of whether/when the JS side calls `initialize(config)`.
  override fun initialize() {
    super.initialize()
    isVisibleJob = moduleScope.launch {
      Bugsy.isVisible.collect { visible -> emitOnIsVisibleChanged(visible) }
    }
  }

  override fun invalidate() {
    isVisibleJob?.cancel()
    isVisibleJob = null
    moduleScope.cancel()
    super.invalidate()
  }

  override fun initialize(config: ReadableMap) {
    val defaults = BugsyConfig()
    val bugsyConfig = defaults.copy(
      trigger = config.optString("trigger")?.let(::parseTrigger) ?: defaults.trigger,
      shakeThresholdG = config.optDouble("shakeThresholdG")?.toFloat()
        ?: defaults.shakeThresholdG,
      allowRevealingSecrets = config.optBoolean("allowRevealingSecrets")
        ?: defaults.allowRevealingSecrets,
      environment = config.optString("environment") ?: defaults.environment,
      slowRequestThresholdMs = config.optDouble("slowRequestThresholdMs")?.toLong()
        ?: defaults.slowRequestThresholdMs,
    )
    // Bugsy.initialize() registers a ProcessLifecycleOwner observer (for the Shake/FloatingButton/
    // Notification trigger detectors), which Android's Lifecycle library requires happen on the
    // main thread — @ReactMethod calls run on the native modules thread, not the UI thread.
    UiThreadUtil.runOnUiThread { Bugsy.initialize(bugsyConfig) }
  }

  override fun destroy() {
    UiThreadUtil.runOnUiThread { Bugsy.destroy() }
  }

  override fun show() = Bugsy.show()

  override fun hide() = Bugsy.hide()

  override fun deviceInfo(promise: Promise) {
    val info = Bugsy.deviceInfo()
    promise.resolve(
      Arguments.createMap().apply {
        putString("appVersionName", info.appVersionName)
        putString("appVersionCode", info.appVersionCode)
        putString("environment", info.environment)
        putString("buildType", info.buildType)
        putString("deviceModel", info.deviceModel)
        putString("osName", info.osName)
        putString("osVersion", info.osVersion)
        putString("locale", info.locale)
        putString("bugsyVersion", info.bugsyVersion)
        putString("kotlinVersion", info.kotlinVersion)
        putString("composeVersion", info.composeVersion)
      }
    )
  }

  override fun addSensitiveHeader(name: String) = Bugsy.addSensitiveHeader(name)

  override fun removeSensitiveHeader(name: String) = Bugsy.removeSensitiveHeader(name)

  override fun addSensitiveBodyField(name: String) = Bugsy.addSensitiveBodyField(name)

  override fun removeSensitiveBodyField(name: String) = Bugsy.removeSensitiveBodyField(name)

  companion object {
    const val NAME = NativeBugsySpec.NAME
  }
}

private fun ReadableMap.optString(key: String): String? = if (hasKey(key)) getString(key) else null

private fun ReadableMap.optDouble(key: String): Double? = if (hasKey(key)) getDouble(key) else null

private fun ReadableMap.optBoolean(key: String): Boolean? =
  if (hasKey(key)) getBoolean(key) else null

/** Falls back to [Trigger.Shake] for a value that doesn't match a [Trigger] member name. */
private fun parseTrigger(value: String): Trigger =
  try {
    Trigger.valueOf(value)
  } catch (e: IllegalArgumentException) {
    Trigger.Shake
  }

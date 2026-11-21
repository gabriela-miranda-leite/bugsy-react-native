package com.bugsyreactnative

import com.bugsy.core.Bugsy
import com.bugsy.core.BugsyConfig
import com.bugsy.core.Trigger
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

/**
 * Translates the typed JS API (DEB-79) into calls on `object Bugsy` (com.bugsy.core, resolved via
 * Maven — DEB-80). `show`/`hide`/`deviceInfo` stay no-ops here; their native wiring lands in
 * DEB-82 (`deviceInfo`/`isVisible` emission) and DEB-83.
 */
class BugsyReactNativeModule(reactContext: ReactApplicationContext) :
  NativeBugsySpec(reactContext) {

  override fun initialize(config: ReadableMap) {
    val defaults = BugsyConfig()
    Bugsy.initialize(
      defaults.copy(
        trigger = config.optString("trigger")?.let(::parseTrigger) ?: defaults.trigger,
        shakeThresholdG = config.optDouble("shakeThresholdG")?.toFloat()
          ?: defaults.shakeThresholdG,
        allowRevealingSecrets = config.optBoolean("allowRevealingSecrets")
          ?: defaults.allowRevealingSecrets,
        environment = config.optString("environment") ?: defaults.environment,
        slowRequestThresholdMs = config.optDouble("slowRequestThresholdMs")?.toLong()
          ?: defaults.slowRequestThresholdMs,
      )
    )
  }

  override fun destroy() = Bugsy.destroy()

  override fun show() = Unit

  override fun hide() = Unit

  override fun deviceInfo(promise: Promise) {
    promise.reject("not_implemented", "Bugsy.deviceInfo() native implementation lands in DEB-82")
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

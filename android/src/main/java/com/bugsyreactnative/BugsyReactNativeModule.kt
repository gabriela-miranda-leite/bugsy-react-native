package com.bugsyreactnative

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

/**
 * Placeholder implementation of the generated spec (DEB-77) so the example app keeps compiling.
 * The real translation to `object Bugsy` lands in DEB-81; `deviceInfo`/`onIsVisibleChanged`
 * wiring specifically lands in DEB-82.
 */
class BugsyReactNativeModule(reactContext: ReactApplicationContext) :
  NativeBugsySpec(reactContext) {

  override fun initialize(config: ReadableMap) = Unit

  override fun destroy() = Unit

  override fun show() = Unit

  override fun hide() = Unit

  override fun deviceInfo(promise: Promise) {
    promise.reject("not_implemented", "Bugsy.deviceInfo() native implementation lands in DEB-82")
  }

  override fun addSensitiveHeader(name: String) = Unit

  override fun removeSensitiveHeader(name: String) = Unit

  override fun addSensitiveBodyField(name: String) = Unit

  override fun removeSensitiveBodyField(name: String) = Unit

  companion object {
    const val NAME = NativeBugsySpec.NAME
  }
}

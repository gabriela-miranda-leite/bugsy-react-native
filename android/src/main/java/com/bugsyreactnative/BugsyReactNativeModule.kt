package com.bugsyreactnative

import com.facebook.react.bridge.ReactApplicationContext

class BugsyReactNativeModule(reactContext: ReactApplicationContext) :
  NativeBugsyReactNativeSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeBugsyReactNativeSpec.NAME
  }
}

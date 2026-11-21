package com.bugsyreactnative

import com.bugsy.core.addBugsyInterceptor
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider

/**
 * Entry point autolinked into every RN host app. Plugging the interceptor here, instead of
 * requiring the app to touch its own networking setup, is what makes Bugsy capture RN traffic
 * with zero config.
 */
class BugsyPackage : BaseReactPackage() {
  init {
    // Builds on createClientBuilder() (RN's defaults, e.g. timeouts/cookie jar), never on
    // createClient() — that one consults this same factory, so calling it here would recurse.
    OkHttpClientProvider.setOkHttpClientFactory(
      OkHttpClientFactory {
        OkHttpClientProvider.createClientBuilder().addBugsyInterceptor().build()
      }
    )
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == BugsyReactNativeModule.NAME) {
      BugsyReactNativeModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      BugsyReactNativeModule.NAME to ReactModuleInfo(
        name = BugsyReactNativeModule.NAME,
        className = BugsyReactNativeModule.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      )
    )
  }
}

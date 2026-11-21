package com.bugsyreactnative

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.lifecycleScope
import com.bugsy.core.Bugsy
import com.bugsy.ui.BugsyAndroidOverlay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

/**
 * Translucent host for `BugsyAndroidOverlay()` (com.bugsy.ui) — RN has no Activity of its own to
 * render Compose UI into, so `show()` (DEB-81) starts this one instead. The overlay composable
 * already gates its own visibility and dismissal on `Bugsy.isVisible` (DEB-82), so this Activity's
 * only job is to finish itself once that flips back to `false` — however that happened: `hide()`,
 * the dialog's own dismiss, or the system back gesture.
 */
class BugsyOverlayActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent { BugsyAndroidOverlay() }
    lifecycleScope.launch {
      Bugsy.isVisible.collectLatest { visible -> if (!visible) finish() }
    }
  }
}

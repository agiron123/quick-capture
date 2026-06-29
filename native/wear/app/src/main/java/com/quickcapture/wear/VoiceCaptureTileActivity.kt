package com.quickcapture.wear

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

/** Launched from the watch tile; sends capture to phone and exits immediately. */
class VoiceCaptureTileActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    lifecycleScope.launch {
      WearCaptureClient.requestVoiceCapture(this@VoiceCaptureTileActivity)
      finish()
    }
  }
}

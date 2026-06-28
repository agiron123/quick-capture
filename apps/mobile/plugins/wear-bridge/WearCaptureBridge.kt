package com.quickcapture.wearbridge

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearCaptureBridgeModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "WearCaptureBridge"

  @ReactMethod
  fun getPendingCapture(promise: Promise) {
    promise.resolve(WearCaptureBridgeStore.getPendingCapture(reactApplicationContext))
  }

  @ReactMethod
  fun clearPendingCapture(promise: Promise) {
    WearCaptureBridgeStore.clearPendingCapture(reactApplicationContext)
    promise.resolve(null)
  }
}

class WearCaptureListenerService : WearableListenerService() {
  override fun onMessageReceived(messageEvent: MessageEvent) {
    if (messageEvent.path != WearCaptureBridgeStore.MESSAGE_PATH_VOICE) return

    WearCaptureBridgeStore.setPendingCapture(applicationContext, "voice")

    val intent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse(WearCaptureBridgeStore.VOICE_DEEP_LINK),
    ).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    startActivity(intent)
  }
}

object WearCaptureBridgeStore {
  const val MESSAGE_PATH_VOICE = "/capture/voice"
  const val VOICE_DEEP_LINK = "quickcapture://voice-record?origin=watch"
  private const val PREFS_NAME = "quickcapture_wear_bridge"
  private const val PENDING_KEY = "wearPendingCapture"

  fun setPendingCapture(context: Context, value: String) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(PENDING_KEY, value)
      .apply()
  }

  fun getPendingCapture(context: Context): String? {
    return context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(PENDING_KEY, null)
  }

  fun clearPendingCapture(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(PENDING_KEY)
      .apply()
  }
}

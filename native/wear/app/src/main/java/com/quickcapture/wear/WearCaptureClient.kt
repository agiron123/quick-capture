package com.quickcapture.wear

import android.content.Context
import com.google.android.gms.wearable.Node
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.tasks.await

object WearCaptureClient {
  const val MESSAGE_PATH_VOICE = "/capture/voice"

  suspend fun requestVoiceCapture(context: Context): Result<Unit> {
    val nodes = connectedNodes(context)
    if (nodes.isEmpty()) {
      return Result.failure(IllegalStateException("no_connected_phone"))
    }

    val messageClient = Wearable.getMessageClient(context)
    var sent = false
    var lastError: Exception? = null

    for (node in nodes) {
      try {
        messageClient.sendMessage(node.id, MESSAGE_PATH_VOICE, ByteArray(0)).await()
        sent = true
      } catch (error: Exception) {
        lastError = error
      }
    }

    return if (sent) {
      Result.success(Unit)
    } else {
      Result.failure(lastError ?: IllegalStateException("send_failed"))
    }
  }

  private suspend fun connectedNodes(context: Context): List<Node> {
    return Wearable.getNodeClient(context).connectedNodes.await()
  }
}

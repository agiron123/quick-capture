package com.quickcapture.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    setContent {
      MaterialTheme {
        val scope = rememberCoroutineScope()
        var status by remember { mutableStateOf<String?>(null) }
        var isSending by remember { mutableStateOf(false) }

        Column(
          modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
          verticalArrangement = Arrangement.Center,
          horizontalAlignment = Alignment.CenterHorizontally,
        ) {
          Text(
            text = stringResource(R.string.app_name),
            style = MaterialTheme.typography.title3,
          )
          Button(
            enabled = !isSending,
            onClick = {
              scope.launch {
                isSending = true
                status = null
                val result = WearCaptureClient.requestVoiceCapture(this@MainActivity)
                status = if (result.isSuccess) {
                  null
                } else if (result.exceptionOrNull()?.message == "no_connected_phone") {
                  getString(R.string.no_phone)
                } else {
                  getString(R.string.no_phone)
                }
                isSending = false
              }
            },
            modifier = Modifier.padding(top = 12.dp),
          ) {
            Text(
              text = if (isSending) {
                stringResource(R.string.sending)
              } else {
                stringResource(R.string.record_voice)
              },
            )
          }
          Text(
            text = status ?: stringResource(R.string.opens_on_phone),
            style = MaterialTheme.typography.caption2,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp),
          )
        }
      }
    }
  }
}

package com.quickcapture.wear

import android.content.Context
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.material.Text
import androidx.wear.protolayout.material.Typography
import androidx.wear.protolayout.material.layouts.PrimaryLayout
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import androidx.wear.tiles.TimelineBuilders
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

class VoiceCaptureTileService : TileService() {
  override fun onTileRequest(
    requestParams: RequestBuilders.TileRequest,
  ): ListenableFuture<TileBuilders.Tile> {
    return Futures.immediateFuture(
      TileBuilders.Tile.Builder()
        .setResourcesVersion(RESOURCES_VERSION)
        .setTileTimeline(
          TimelineBuilders.Timeline.Builder()
            .addTimelineEntry(
              TimelineBuilders.TimelineEntry.Builder()
                .setLayout(
                  LayoutElementBuilders.Layout.Builder()
                    .setRoot(tileLayout(requestParams, this))
                    .build(),
                )
                .build(),
            )
            .build(),
        )
        .build(),
    )
  }

  override fun onTileResourcesRequest(
    requestParams: RequestBuilders.ResourcesRequest,
  ): ListenableFuture<ResourceBuilders.Resources> {
    return Futures.immediateFuture(
      ResourceBuilders.Resources.Builder()
        .setVersion(RESOURCES_VERSION)
        .build(),
    )
  }

  private fun tileLayout(
    requestParams: RequestBuilders.TileRequest,
    context: Context,
  ): LayoutElementBuilders.LayoutElement {
    val launchCapture = ActionBuilders.LaunchAction.Builder()
      .setAndroidActivity(
        ActionBuilders.AndroidActivity.Builder()
          .setClassName(context.packageName, VoiceCaptureTileActivity::class.java.name)
          .build(),
      )
      .build()

    val clickable = ModifiersBuilders.Modifiers.Builder()
      .setClickable(
        ModifiersBuilders.Clickable.Builder()
          .setOnClick(launchCapture)
          .build(),
      )
      .build()

    val label = Text.Builder(context, context.getString(R.string.record_voice))
      .setTypography(Typography.TYPOGRAPHY_BODY2)
      .setModifiers(clickable)
      .build()

    return PrimaryLayout.Builder(requestParams.deviceParameters)
      .setResponsiveContentInsetEnabled(true)
      .setPrimaryLabelTextContent(context.getString(R.string.app_name))
      .setContent(label)
      .build()
  }

  private companion object {
    const val RESOURCES_VERSION = "1"
  }
}

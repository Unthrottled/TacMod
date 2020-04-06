package io.unthrottled.sogos.tacmod.pomodoro

import android.util.Log
import com.google.gson.Gson
import io.unthrottled.sogos.tacmod.ACTIVITY_NAME
import io.unthrottled.sogos.tacmod.pomodoro.APIService.performRequest
import okhttp3.FormBody
import okhttp3.Headers
import okhttp3.Request

object OAuthService {
  private val gson = Gson()
  fun getHeaders(
      updatedPomodoroSettings: PomodoroParameters,
      function: (Headers, PomodoroParameters) -> Unit,
      error: (e: Throwable) -> Unit
  ) {
    if (isTokenValid(updatedPomodoroSettings.securityStuff.accessToken)) {
      function(
          buildHeaders(updatedPomodoroSettings),
          updatedPomodoroSettings
      )
    } else {
      refreshToken(updatedPomodoroSettings, { refreshPomoSettings ->
        function(
            buildHeaders(refreshPomoSettings),
            refreshPomoSettings
        )
      }) {
        error(it)
      }
    }
  }

  private fun refreshToken(
      updatedPomodoroSettings: PomodoroParameters,
      function: (refreshedPomo: PomodoroParameters) -> Unit,
      error: (e: Throwable) -> Unit
  ) {
    Log.i(ACTIVITY_NAME, "Refreshing Token!")
    performRequest(
        Request.Builder()
            .url(updatedPomodoroSettings.securityStuff.tokenEndpoint)
            .post(
                FormBody.Builder()
                    .add("grant_type", "refresh_token")
                    .add("client_id", updatedPomodoroSettings.securityStuff.clientId)
                    .add("refresh_token", updatedPomodoroSettings.securityStuff.refreshToken)
                    .build()
            )
            .build(),
        {
          val accessTokenResponse = gson.fromJson(it, RefreshTokenResponse::class.java)
          function(
              updatedPomodoroSettings.apply {
                this.securityStuff.accessToken = accessTokenResponse.access_token
              }
          )
        }
    ) {
      error(it)
    }
  }

  private fun buildHeaders(
      updatedPomodoroSettings: PomodoroParameters
  ): Headers {
    return Headers.Builder()
        .add("User-Identifier", updatedPomodoroSettings.securityStuff.guid)
        .add("Verification", updatedPomodoroSettings.securityStuff.verificationCode)
        .add("Authorization", "Bearer ${updatedPomodoroSettings.securityStuff.accessToken}")
        .build()
  }
}
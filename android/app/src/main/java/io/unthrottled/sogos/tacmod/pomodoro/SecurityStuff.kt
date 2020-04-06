package io.unthrottled.sogos.tacmod.pomodoro

import android.util.Log
import com.auth0.jwt.JWT
import io.unthrottled.sogos.tacmod.ACTIVITY_NAME
import java.time.Duration
import java.time.Instant

fun isTokenValid(accessToken: String): Boolean {
  return try {
    val token = JWT.decode(accessToken)
    Duration.between(
        Instant.now(),
        token.expiresAt.toInstant()
    ).toMinutes() > 5
  } catch (t: Throwable) {
    Log.e(ACTIVITY_NAME, "Unable to refresh token for raisins ", t)
    false
  }
}

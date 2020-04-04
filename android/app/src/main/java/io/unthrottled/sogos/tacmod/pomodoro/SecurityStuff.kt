package io.unthrottled.sogos.tacmod.pomodoro

import com.auth0.jwt.JWT
import java.time.Duration
import java.time.Instant

fun isTokenValid(accessToken: String): Boolean {
  return try {
    val token = JWT.decode(accessToken)
    Duration.between(
        token.expiresAt.toInstant(),
        Instant.now()
    ).toMinutes() > 5
  } catch (t: Throwable) {
    System.err.println("Unable to refresh token for rasins " + t.message)
    false
  }
}


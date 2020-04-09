package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import java.time.Instant

data class SecurityStuff(
  var accessToken: String,
  var refreshToken: String,
  val tokenEndpoint: String,
  val clientId: String,
  val verificationCode: String,
  val guid: String
)

data class PomodoroSettings(
    val loadDuration: Int, //milliseconds
    val shortRecoveryDuration: Int,
    val longRecoveryDuration: Int
)

data class ActivityContent(
    val name: String,
    val uuid: String,
    val activityID: String?
)

data class Activity(
    val antecedenceTime: Long,
    val content: ActivityContent,
    var json: ReadableMap
)

data class PomodoroParameters(
    val apiURL: String,
    val pomodoroSettings: PomodoroSettings,
    val currentActivity: Activity,
    val previousActivity: Activity,
    var numberOfCompletedPomodoro: Int,
    val securityStuff: SecurityStuff,
    val json: ReadableMap
)

data class RefreshTokenResponse(
    val access_token: String,
    val refresh_token: String?
)

fun mapToPomodoroParameters(
    pomodoroParam: ReadableMap
): PomodoroParameters {
  return PomodoroParameters(
      pomodoroParam.getString("apiURL") ?: "lol nope!!",
      PomodoroSettings(
          pomodoroParam.getMap("pomodoroSettings")?.getInt("loadDuration") ?: 1620000,
          pomodoroParam.getMap("pomodoroSettings")?.getInt("shortRecoveryDuration") ?: 180000,
          pomodoroParam.getMap("pomodoroSettings")?.getInt("longRecoveryDuration") ?: 2400000
      ),
      buildActivity(pomodoroParam.getMap("currentActivity")),
      buildActivity(pomodoroParam.getMap("previousActivity")),
      pomodoroParam.getInt("numberOfCompletedPomodoro"),
      buildSecurityStuff(pomodoroParam),
      pomodoroParam
  )
}

fun buildSecurityStuff(pomodoroParam: ReadableMap): SecurityStuff {
  return SecurityStuff(
      pomodoroParam.getMap("securityStuff")?.getString("accessToken") ?: "nada",
      pomodoroParam.getMap("securityStuff")?.getString("refreshToken") ?: "nada",
      pomodoroParam.getMap("securityStuff")?.getString("tokenEndpoint") ?: "nada",
      pomodoroParam.getMap("securityStuff")?.getString("clientId") ?: "nada",
      pomodoroParam.getMap("securityStuff")?.getString("verificationCode") ?: "nada",
      pomodoroParam.getMap("securityStuff")?.getString("guid") ?: "nada"
  )
}

fun buildActivity(map: ReadableMap?): Activity {
  return Activity(
      map?.getDouble("antecedenceTime")?.toLong() ?: Instant.now().toEpochMilli(),
      ActivityContent(
          map?.getMap("content")?.getString("name") ?: "Lul Dunno",
          map?.getMap("content")?.getString("uuid") ?: "Lul Dunno",
          getActivityId(map)
      ),
      map ?: Arguments.createMap()
  )
}

private fun getActivityId(map: ReadableMap?): String? =
    if (map?.getMap("content")?.hasKey("activityID") == true)
      map.getMap("content")?.getString("activityID")
    else null
package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.unthrottled.sogos.tacmod.alarm.AlarmParameters
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import io.unthrottled.sogos.tacmod.alarm.NotificationMessage
import io.unthrottled.sogos.tacmod.alarm.VibrationPattern
import java.time.Instant
import java.util.*
import java.util.concurrent.Executor

data class SecurityStuff(
    var accessToken: String,
    val refreshToken: String,
    val tokenEndpoint: String,
    val clientId: String
)

data class PomodoroSettings(
    val loadDuration: Int, //milliseconds
    val shortRecoveryDuration: Int,
    val longRecoveryDuration: Int
)

data class ActivityContent(
    val name: String
)

data class Activity(
    val antecedenceTime: Long,
    val content: ActivityContent,
    var json: ReadableMap
)

data class PomodoroParameters(
    val pomodoroSettings: PomodoroSettings,
    val currentActivity: Activity,
    val previousActivity: Activity,
    var numberOfCompletedPomodoro: Int,
    val securityStuff: SecurityStuff,
    val json: ReadableMap
)


class PomodoroModule(
    private val reactContext: ReactApplicationContext,
    private val executor: Executor
) : ReactContextBaseJavaModule(reactContext) {

  init {
    AlarmService.setReactContextSupplier {
      reactContext
    }
  }

  override fun getName(): String = "Pomodoro"

  fun mapToPomodoroParameters(
      pomodoroParam: ReadableMap
  ): PomodoroParameters {
    return PomodoroParameters(
        PomodoroSettings(
            pomodoroParam.getMap("pomodoroSettings")?.getInt("loadDuration") ?: 1620000,
            pomodoroParam.getMap("pomodoroSettings")?.getInt("loadDuration") ?: 180000,
            pomodoroParam.getMap("pomodoroSettings")?.getInt("loadDuration") ?: 2400000
        ),
        buildActivity(pomodoroParam.getMap("currentActivity")),
        buildActivity(pomodoroParam.getMap("previousActivity")),
        pomodoroParam.getInt("numberOfCompletedPomodoro"),
        buildSecurityStuff(pomodoroParam),
        pomodoroParam
    )
  }

  private fun buildSecurityStuff(pomodoroParam: ReadableMap): SecurityStuff {
    return SecurityStuff(
        pomodoroParam.getMap("securityStuff")?.getString("accessToken") ?: "nada",
        pomodoroParam.getMap("securityStuff")?.getString("refreshToken") ?: "nada",
        pomodoroParam.getMap("securityStuff")?.getString("tokenEndpoint") ?: "nada",
        pomodoroParam.getMap("securityStuff")?.getString("clientId") ?: "nada"
    )
  }

  private fun buildActivity(map: ReadableMap?): Activity {
    return Activity(
        map?.getDouble("antecedenceTime")?.toLong() ?: Instant.now().toEpochMilli(),
        ActivityContent(
            map?.getMap("content")?.getString("name") ?: "Lul Dunno"
        ),
        map ?: Arguments.createMap()
    )
  }

  @ReactMethod
  fun commencePomodoroForActivity(pomodoroThings: ReadableMap) {
    startPomodoro(mapToPomodoroParameters(pomodoroThings))
  }

  private fun startPomodoro(pomodoroThings: PomodoroParameters) {
    AlarmService.scheduleAlarm(
        reactContext.applicationContext,
        AlarmParameters(
            NotificationMessage(
                "${pomodoroThings.currentActivity.content.name} pomodoro complete!",
                "Take a break!"
            ),
            calculateTimeToAlert(pomodoroThings),
            calculateVibrationPattern(pomodoroThings)
        )
    )

    AlarmService.setCompletionListener {
      val updatedPomodoroSettings = pomodoroThings.apply {
        this.numberOfCompletedPomodoro += 1
      }
      checkCurrentActivity(updatedPomodoroSettings)
          .ifPresent {
            // attempt to register new activity.
            val breakDuration = calculateRestTime(updatedPomodoroSettings)
            runSafely {
              val moreUpToDatePomoSettings = setCurrentActivity(buildBreak(breakDuration), updatedPomodoroSettings)
              AlarmService.scheduleAlarm(
                  reactContext.applicationContext,
                  AlarmParameters(
                      NotificationMessage(
                          "Break is over!",
                          "Get back to ${moreUpToDatePomoSettings.currentActivity.content.name}"
                      ),
                      breakDuration + Instant.now().toEpochMilli(),
                      calculateVibrationPattern(moreUpToDatePomoSettings)
                  )
              )

              val breakActivity = buildBreak(breakDuration)
              val jsModule = reactContext.getJSModule(
                  DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
              )
              jsModule.emit(
                  "StartedPomodoroBreak",
                  breakActivity
              )

              AlarmService.setCompletionListener {
                // set current activity to working activity
                val mostUpToDatePomoSettings =
                    setCurrentActivity(buildActivity(moreUpToDatePomoSettings), moreUpToDatePomoSettings)

                jsModule.emit(
                    "StartedPomodoroActivity",
                    buildActivity(mostUpToDatePomoSettings)
                )

                startPomodoro(
                    mostUpToDatePomoSettings.apply {
                      this.currentActivity.json = buildActivity(pomodoroThings)
                    }
                )
              }
            }
          }

    }
  }

  private fun runSafely(runMeSafePls: () -> Unit) {
    val jsModule = reactContext.getJSModule(
        DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    )
    try {
      runMeSafePls()
    } catch (t: Throwable) {
      // oh noessss!!!11
      jsModule.emit("PomodoroError", Arguments.createMap())
    }
  }

  private fun checkCurrentActivity(updatedPomodoroSettings: PomodoroParameters): Optional<PomodoroParameters> {
    TODO("Not yet implemented")
  }

  private fun setCurrentActivity(
      buildBreak: WritableMap?,
      pomodoroThings: PomodoroParameters
  ): PomodoroParameters {
    TODO("Not yet implemented")
  }

  private fun buildBreak(breakDuration: Int): WritableMap? {
    val breakActivity = Arguments.createMap()
    breakActivity.putDouble("antecedenceTime", Instant.now().toEpochMilli().toDouble())
    val breakContent = Arguments.createMap()
    breakContent.putString("uuid", UUID.randomUUID().toString())
    breakContent.putString("name", "RECOVERY")
    breakContent.putString("type", "ACTIVE")
    breakContent.putString("timedType", "TIMER")
    breakContent.putBoolean("nativeManaged", true)
    breakContent.putInt("duration", breakDuration)
    breakActivity.putMap("content", breakContent)
    return breakActivity
  }

  private fun buildActivity(pomodoroThings: PomodoroParameters): WritableMap {
    val loadActivity = Arguments.createMap()
    loadActivity.putDouble("antecedenceTime", Instant.now().toEpochMilli().toDouble())
    val loadContent = Arguments.createMap()
    loadContent.putString("uuid", UUID.randomUUID().toString())
    loadContent.putString("name", pomodoroThings.currentActivity.content.name)
    loadContent.putString("type", "ACTIVE")
    loadContent.putString("timedType", "TIMER")
    loadContent.putBoolean("nativeManaged", true)
    loadContent.putString("activityID", pomodoroThings.json.getMap("currentActivity")?.getMap("content")?.getString("activityID"))
    loadContent.putInt("duration", pomodoroThings.pomodoroSettings.loadDuration)
    loadActivity.putMap("content", loadContent)
    return loadActivity
  }

  private fun calculateVibrationPattern(pomodoroThings: PomodoroParameters): VibrationPattern =
      when {
        pomodoroThings.numberOfCompletedPomodoro % 4 == 0 -> VibrationPattern.LONG
        else -> VibrationPattern.SHORT
      }

  private fun calculateTimeToAlert(pomodoroThings: PomodoroParameters): Long {
    val loadDuration = pomodoroThings.currentActivity.json
        .getMap("content")
        ?.getInt("duration") ?: pomodoroThings.pomodoroSettings.loadDuration
    val antecedenceTime = Instant.now().toEpochMilli()
    return loadDuration + antecedenceTime
  }

  private fun calculateRestTime(pomodoroThings: PomodoroParameters): Int {
    return if (pomodoroThings.numberOfCompletedPomodoro % 4 == 0) pomodoroThings.pomodoroSettings.longRecoveryDuration
    else pomodoroThings.pomodoroSettings.shortRecoveryDuration
  }

  @ReactMethod
  fun stopItGetSomeHelp() {
    AlarmService.stopItGetSomeHelp(reactContext)
  }
}
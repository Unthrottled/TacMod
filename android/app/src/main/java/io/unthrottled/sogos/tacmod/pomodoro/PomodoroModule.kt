package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.unthrottled.sogos.tacmod.alarm.AlarmParameters
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import io.unthrottled.sogos.tacmod.alarm.NotificationMessage
import io.unthrottled.sogos.tacmod.alarm.VibrationPattern
import java.time.Instant
import java.util.concurrent.Executor
import kotlin.math.floor

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
    val content: ActivityContent
)

data class PomodoroParameters(
    val pomodoroSettings: PomodoroSettings,
    val currentActivity: Activity,
    val previousActivity: Activity,
    var numberOfCompletedPomodoro: Int,
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
        pomodoroParam
    )
  }

  private fun buildActivity(map: ReadableMap?): Activity {
    return Activity(
        map?.getDouble("antecedenceTime")?.toLong() ?: Instant.now().toEpochMilli(),
        ActivityContent(
            map?.getMap("content")?.getString("name") ?: "Lul Dunno"
        )
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

      // set current activity to be break


      AlarmService.scheduleAlarm(
          reactContext.applicationContext,
          AlarmParameters(
              NotificationMessage(
                  "Break is over!",
                  "Get back to ${updatedPomodoroSettings.currentActivity.content.name}"
              ),
              calculateRestTime(updatedPomodoroSettings),
              calculateVibrationPattern(updatedPomodoroSettings)
          )
      )

      val breakActivity = Arguments.createMap()
      reactContext.getJSModule(
          DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
      ).emit(
          "StartedPomodoroActivity",
          breakActivity
      )

      AlarmService.setCompletionListener {
        // set current activity to working activity

        reactContext.getJSModule(
            DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
        ).emit(
            "StartedPomodoroActivity",
            pomodoroThings.json.getMap("currentActivity")
        )

        startPomodoro(
            updatedPomodoroSettings
        )
      }
    }
  }

  private fun calculateVibrationPattern(pomodoroThings: PomodoroParameters): VibrationPattern =
      when {
        pomodoroThings.numberOfCompletedPomodoro % 4 == 0 -> VibrationPattern.LONG
        else -> VibrationPattern.SHORT
      }

  private fun calculateTimeToAlert(pomodoroThings: PomodoroParameters): Long {
    val loadDuration = pomodoroThings.pomodoroSettings.loadDuration
    val antecedenceTime = pomodoroThings.currentActivity.antecedenceTime
    return loadDuration + antecedenceTime
  }

  private fun calculateRestTime(pomodoroThings: PomodoroParameters): Long {
    val loadDuration =
        if (pomodoroThings.numberOfCompletedPomodoro % 4 == 0) pomodoroThings.pomodoroSettings.longRecoveryDuration
        else pomodoroThings.pomodoroSettings.shortRecoveryDuration

    val antecedenceTime = Instant.now().toEpochMilli()
    return loadDuration + antecedenceTime
  }

  @ReactMethod
  fun stopItGetSomeHelp() {
    AlarmService.stopItGetSomeHelp(reactContext)
  }
}
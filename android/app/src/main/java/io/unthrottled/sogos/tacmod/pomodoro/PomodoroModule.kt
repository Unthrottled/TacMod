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


      val breakDuration = calculateRestTime(updatedPomodoroSettings)
      AlarmService.scheduleAlarm(
          reactContext.applicationContext,
          AlarmParameters(
              NotificationMessage(
                  "Break is over!",
                  "Get back to ${updatedPomodoroSettings.currentActivity.content.name}"
              ),
              breakDuration + Instant.now().toEpochMilli(),
              calculateVibrationPattern(updatedPomodoroSettings)
          )
      )

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
      val jsModule = reactContext.getJSModule(
          DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
      )
      jsModule.emit(
          "StartedPomodoroBreak",
          breakActivity
      )

      AlarmService.setCompletionListener {
        // set current activity to working activity

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
        jsModule.emit(
            "StartedPomodoroActivity",
            loadActivity
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
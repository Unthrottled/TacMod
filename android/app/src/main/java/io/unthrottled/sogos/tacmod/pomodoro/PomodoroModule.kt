package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import io.unthrottled.sogos.tacmod.alarm.AlarmParameters
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import io.unthrottled.sogos.tacmod.alarm.NotificationMessage
import io.unthrottled.sogos.tacmod.alarm.VibrationPattern
import java.time.Instant
import java.util.concurrent.Executor
import kotlin.math.floor

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

  @ReactMethod
  fun commencePomodoroForActivity(pomodoroThings: ReadableMap) {
    AlarmService.scheduleAlarm(
        reactContext.applicationContext,
        AlarmParameters(
            NotificationMessage(
                "${getActivityName(pomodoroThings)} pomodoro complete!",
                "Take a break!"
            ),
            calculateTimeToAlert(pomodoroThings),
            calculateVibrationPattern(pomodoroThings)
        )
    )

    // todo: how to update ui??? (When brought to foreground recalculate current activity?????)
    AlarmService.setCompletionListener {
      // set break

      AlarmService.setCompletionListener {
        commencePomodoroForActivity(
            pomodoroThings// update completion count
        ) // Recursion!
      }
    }
  }

  private fun calculateVibrationPattern(pomodoroThings: ReadableMap): VibrationPattern =
      when {
        pomodoroThings.getInt("numberOfCompletedPomodoro") % 4 == 0 -> VibrationPattern.LONG
        else -> VibrationPattern.SHORT
      }

  private fun calculateTimeToAlert(pomodoroThings: ReadableMap): Long {
    val loadDuration = pomodoroThings.getMap("pomodoroSettings")
        ?.getInt("loadDuration") ?: 0
    val meow = Instant.now().toEpochMilli()
    val antecedenceTime = pomodoroThings.getMap("currentActivity")
        ?.getDouble("antecedenceTime")?.toLong() ?: meow
    return floor(
        ((loadDuration + antecedenceTime) - meow).toDouble() / 1000
    ).toLong()

  }

  private fun getActivityName(pomodoroThings: ReadableMap): String =
      pomodoroThings.getMap("currentActivity")
          ?.getMap("content")
          ?.getString("name") ?: "Activity"

  @ReactMethod
  fun stopItGetSomeHelp() {
    AlarmService.stopItGetSomeHelp(reactContext)
  }
}
package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.unthrottled.sogos.tacmod.alarm.VibrationPattern
import java.time.Instant
import java.util.*

object PomodoroService {

  fun buildBreak(breakDuration: Int): WritableMap? {
    val breakActivity = Arguments.createMap()
    breakActivity.putDouble("antecedenceTime", Instant.now().toEpochMilli().toDouble())
    val breakContent = Arguments.createMap()
    breakContent.putString("uuid", UUID.randomUUID().toString())
    breakContent.putString("name", "RECOVERY")
    breakContent.putString("type", "ACTIVE")
    breakContent.putString("timedType", "TIMER")
    breakContent.putBoolean("nativeManaged", true)
    breakContent.putBoolean("autoStart", true)
    breakContent.putInt("duration", breakDuration)
    breakActivity.putMap("content", breakContent)
    return breakActivity
  }

  fun buildActivityMap(pomodoroThings: PomodoroParameters): WritableMap {
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

  fun calculateVibrationPattern(pomodoroThings: PomodoroParameters): VibrationPattern =
      when {
        pomodoroThings.numberOfCompletedPomodoro % 4 == 0 -> VibrationPattern.LONG
        else -> VibrationPattern.SHORT
      }

  fun calculateTimeToAlert(pomodoroThings: PomodoroParameters): Long {
    val loadDuration = pomodoroThings.currentActivity.json
        .getMap("content")
        ?.getInt("duration") ?: pomodoroThings.pomodoroSettings.loadDuration
    val antecedenceTime = Instant.now().toEpochMilli()
    return loadDuration + antecedenceTime
  }

  fun calculateRestTime(pomodoroThings: PomodoroParameters): Int {
    return if (pomodoroThings.numberOfCompletedPomodoro % 4 == 0) pomodoroThings.pomodoroSettings.longRecoveryDuration
    else pomodoroThings.pomodoroSettings.shortRecoveryDuration
  }
}
package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import io.unthrottled.sogos.tacmod.alarm.AlarmParameters
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import io.unthrottled.sogos.tacmod.alarm.NotificationMessage
import io.unthrottled.sogos.tacmod.pomodoro.APIService.performRequest
import io.unthrottled.sogos.tacmod.pomodoro.OAuthService.getHeaders
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.buildActivityMap
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.buildBreak
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.calculateRestTime
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.calculateTimeToAlert
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.calculateVibrationPattern
import okhttp3.MediaType
import okhttp3.Request
import okhttp3.RequestBody
import java.time.Instant
import java.util.concurrent.Executor

class PomodoroModule(
    private val reactContext: ReactApplicationContext,
    private val executor: Executor
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private val gson = Gson()
  }

  init {
    AlarmService.setReactContextSupplier {
      reactContext
    }
  }

  override fun getName(): String = "Pomodoro"

  @ReactMethod
  fun commencePomodoroForActivity(pomodoroThings: ReadableMap) {
    startPomodoro(mapToPomodoroParameters(pomodoroThings))
  }

  @ReactMethod
  fun stopItGetSomeHelp() {
    AlarmService.stopItGetSomeHelp(reactContext)
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

      checkCurrentActivity(updatedPomodoroSettings) { newestPomoSettings ->
        // attempt to register new activity.
        val breakDuration = calculateRestTime(newestPomoSettings)
        setCurrentActivity(buildBreak(breakDuration), newestPomoSettings) { moreUpToDatePomoSettings ->
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
            setCurrentActivity(buildActivityMap(moreUpToDatePomoSettings), moreUpToDatePomoSettings) { mostUpToDatePomoSettings ->
              jsModule.emit(
                  "StartedPomodoroActivity",
                  buildActivityMap(mostUpToDatePomoSettings)
              )

              startPomodoro(
                  mostUpToDatePomoSettings.apply {
                    this.currentActivity.json = buildActivityMap(pomodoroThings)
                  }
              )
            }
          }
        }
      }
    }
  }

  private fun checkCurrentActivity(
      updatedPomodoroSettings: PomodoroParameters,
      callback: (p: PomodoroParameters) -> Unit
      // todo: error callback
  ) {
    getHeaders(updatedPomodoroSettings) { headers, pomoStuffToSend ->
      performRequest(
          Request.Builder()
              .headers(headers)
              .url(
                  "${pomoStuffToSend.apiURL}/activity/current"
              )
              .build(),
          {
            val activity = gson.fromJson(it, Activity::class.java)
            if (
                activity.content.activityID == pomoStuffToSend.currentActivity.content.activityID
            // todo: recovery same?????
            ) {
              callback(pomoStuffToSend)
            } else {
              System.err.println("Activities not same, do not start!!!!")
            }

          }
      ) {
        // todo: meeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
      }
    }
  }

  private fun setCurrentActivity(
      buildBreak: WritableMap?,
      pomodoroThings: PomodoroParameters,
      callBack: (upDate: PomodoroParameters) -> Unit
      // todo: error
  ) {
    getHeaders(pomodoroThings) { headers, pomoStuffToSend ->
      performRequest(
          Request.Builder()
              .headers(headers)
              .url(
                  "${pomoStuffToSend.apiURL}/activity/current"
              )
              .post(RequestBody.create(
                  MediaType.get("application/json"),
                  gson.toJson(buildBreak?.toHashMap())
              ))
              .build(),
          {
            callBack(pomoStuffToSend)
          }
      ) {
        // todo: meeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
      }
    }
  }
}
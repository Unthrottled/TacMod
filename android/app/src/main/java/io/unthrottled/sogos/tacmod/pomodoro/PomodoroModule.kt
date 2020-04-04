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
    scheduleLoadAlarm(pomodoroThings)

    AlarmService.setCompletionListener {
      val pomoWithUpdatedCount = pomodoroThings.apply {
        this.numberOfCompletedPomodoro += 1
      }

      checkCurrentActivity(pomoWithUpdatedCount) { pomoSettingsAfterFirstCheck ->

        val breakDuration = calculateRestTime(pomoSettingsAfterFirstCheck)
        setCurrentActivity(
            buildBreak(breakDuration),
            pomoSettingsAfterFirstCheck
        ) { pomoSettingsAfterSettingBreak ->

          scheduleBreakAlarm(pomoSettingsAfterSettingBreak, breakDuration)

          val jsModule = reactContext.getJSModule(
              DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
          )

          notifyJavascriptOfBreak(breakDuration, jsModule)

          AlarmService.setCompletionListener {
            checkRecoveryActivity(
                pomoSettingsAfterSettingBreak
            ) { pomoSettingsAfterCheckingIfRecovery ->

              setCurrentActivity(
                  buildActivityMap(pomoSettingsAfterCheckingIfRecovery),
                  pomoSettingsAfterCheckingIfRecovery
              ) { pomoSettingsAfterSettingLoadAgain ->

                jsModule.emit(
                    "StartedPomodoroActivity",
                    buildActivityMap(pomoSettingsAfterSettingLoadAgain)
                )

                // recursion!!
                startPomodoro(
                    pomoSettingsAfterSettingLoadAgain.apply {
                      this.currentActivity.json = buildActivityMap(pomodoroThings)
                    }
                )
              }
            }
          }
        }
      }
    }
  }

  private fun scheduleLoadAlarm(pomodoroThings: PomodoroParameters) {
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
  }

  private fun notifyJavascriptOfBreak(breakDuration: Int, jsModule: DeviceEventManagerModule.RCTDeviceEventEmitter) {
    val breakActivity = buildBreak(breakDuration)
    jsModule.emit(
        "StartedPomodoroBreak",
        breakActivity
    )
  }

  private fun scheduleBreakAlarm(moreUpToDatePomoSettings: PomodoroParameters, breakDuration: Int) {
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
  }

  private fun checkCurrentActivity(
      updatedPomodoroSettings: PomodoroParameters,
      callback: (p: PomodoroParameters) -> Unit
      // todo: error callback
  ) {
    performCurrentActivityFetch(updatedPomodoroSettings) { activity, pomoStuffToSend ->
      if (activity.content.activityID == pomoStuffToSend.currentActivity.content.activityID) {
        callback(pomoStuffToSend)
      } else {
        System.err.println("Activities not same, do not start!!!!")
      }
    }
  }

  private fun checkRecoveryActivity(
      updatedPomodoroSettings: PomodoroParameters,
      callback: (p: PomodoroParameters) -> Unit
      // todo: error callback
  ) {
    performCurrentActivityFetch(updatedPomodoroSettings) { activity, pomoStuffToSend ->
      if (activity.content.activityID == null &&
          activity.content.name == "RECOVERY") {
        callback(pomoStuffToSend)
      } else {
        System.err.println("Activities not same, do not start!!!!")
      }
    }
  }

  private fun performCurrentActivityFetch(
      updatedPomodoroSettings: PomodoroParameters,
      doStuff: (activity: Activity, pomoStuff: PomodoroParameters) -> Unit
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
            doStuff(activity, pomoStuffToSend)
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
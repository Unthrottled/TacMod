package io.unthrottled.sogos.tacmod.pomodoro

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import io.unthrottled.sogos.tacmod.ACTIVITY_NAME
import io.unthrottled.sogos.tacmod.alarm.AlarmParameters
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import io.unthrottled.sogos.tacmod.alarm.AlarmService.setCompletionListener
import io.unthrottled.sogos.tacmod.alarm.NotificationMessage
import io.unthrottled.sogos.tacmod.pomodoro.APIService.performRequest
import io.unthrottled.sogos.tacmod.pomodoro.OAuthService.getHeaders
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.buildActivityMap
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.buildBreak
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.calculateRestTime
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.calculateTimeToAlert
import io.unthrottled.sogos.tacmod.pomodoro.PomodoroService.calculateVibrationPattern
import io.unthrottled.sogos.tacmod.utils.AlarmAlertWakeLock
import io.unthrottled.sogos.tacmod.utils.AlarmAlertWakeLock.releaseCpuLock
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
    AlarmAlertWakeLock.acquireCpuWakeLock(reactContext)
    startPomodoro(mapToPomodoroParameters(pomodoroThings))
  }

  @ReactMethod
  fun stopItGetSomeHelp() {
    AlarmService.stopItGetSomeHelp(reactContext)
    releaseCpuLock()
  }

  private fun startPomodoro(pomodoroThings: PomodoroParameters, currentContext: Context = this.reactContext) {
    val jsModule = reactContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    )
    if (isBreak(pomodoroThings.currentActivity)) {
      val breakDuration = calculateRestTime(pomodoroThings)
      scheduleBreakAlarm(pomodoroThings, breakDuration, currentContext)

      setCompletionListener {breakContext ->
        checkRecoveryActivity(
          pomodoroThings,
          { pomoSettingsAfterCheckingIfRecovery ->
            setCurrentActivity(
              buildActivityMap(pomoSettingsAfterCheckingIfRecovery),
              pomoSettingsAfterCheckingIfRecovery,
              { pomoSettingsAfterSettingLoadAgain ->

                notifyJavascriptOfActivityStart(jsModule, pomoSettingsAfterSettingLoadAgain)

                // recursion!!
                startPomodoro(
                  pomoSettingsAfterSettingLoadAgain.apply {
                    this.currentActivity.json = buildActivityMap(pomodoroThings) // todo: make sure that updating current activity
                  },
                  breakContext
                )
              }) {
              notifyJavascriptOfError("Unable to set load activity as current, the second time", it, jsModule)
            }
          }, {
          notifyJavascriptOfCancellation(jsModule)
        }){
          notifyJavascriptOfError("Unable to check to see if the current activity is recovery", it, jsModule)
        }
      }
    } else {
      scheduleLoadAlarm(pomodoroThings, currentContext)

      setCompletionListener {loadContext ->
        val pomoWithUpdatedCount = pomodoroThings.apply {
          this.numberOfCompletedPomodoro += 1
        }
        checkCurrentActivity(pomoWithUpdatedCount, { pomoSettingsAfterActivityCheck ->
          val breakDuration = calculateRestTime(pomoSettingsAfterActivityCheck)
          setCurrentActivity(
            buildBreak(breakDuration),
            pomoSettingsAfterActivityCheck,
            { pomoSettingsAfterSettingBreak ->

              notifyJavascriptOfBreak(breakDuration, jsModule)

              // recursion!!
              startPomodoro(
                pomoSettingsAfterSettingBreak.apply {
                  this.currentActivity.json = buildActivityMap(pomodoroThings) // todo: make sure that updating current activity
                },
                loadContext
              )
            }) {
            notifyJavascriptOfError("Unable to set current activity to recovery", it, jsModule)
          }
        }, {
          notifyJavascriptOfCancellation(jsModule)
        }) {
          notifyJavascriptOfError("Unable to check if current activity is the first load activity", it, jsModule)
        }
      }
    }
  }

  private fun notifyJavascriptOfActivityStart(jsModule: DeviceEventManagerModule.RCTDeviceEventEmitter, pomoSettingsAfterSettingLoadAgain: PomodoroParameters) {
    try {
      jsModule.emit(
        "StartedPomodoroActivity",
        buildActivityMap(pomoSettingsAfterSettingLoadAgain)
      )
    } catch (e: Exception) {
      Log.e(ACTIVITY_NAME, "Unable to notify javascript of activity start", e)
    }
  }

  private fun notifyJavascriptOfCancellation(jsModule: DeviceEventManagerModule.RCTDeviceEventEmitter?) {
    try {
      jsModule?.emit(
        "PomodoroCanceled",
        Arguments.createMap()
      )
    } catch (e: Exception) {
      Log.e(ACTIVITY_NAME, "Unable to notify javascript of cancellation", e)
    }
  }

  private fun notifyJavascriptOfError(
    message: String,
    error: Throwable,
    jsModule: DeviceEventManagerModule.RCTDeviceEventEmitter
  ) {
    val errorPayload = Arguments.createMap()
    errorPayload.putString("message", message)
    errorPayload.putString("error", error.message)
    try {
      jsModule.emit(
        "PomodoroError",
        errorPayload
      )
    } catch (e: Exception) {
      Log.e(ACTIVITY_NAME, "Unable to notify javascript of error", e)
    }
  }

  private fun scheduleLoadAlarm(pomodoroThings: PomodoroParameters, currentContext: Context) {
    AlarmService.scheduleAlarm(
      currentContext,
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
    try {
      val breakActivity = buildBreak(breakDuration)
      jsModule.emit(
        "StartedPomodoroBreak",
        breakActivity
      )
    } catch (e: Exception) {
      Log.e(ACTIVITY_NAME, "Unable to notify javascript of break", e)
    }
  }

  private fun scheduleBreakAlarm(moreUpToDatePomoSettings: PomodoroParameters, breakDuration: Int, currentContext: Context) {
    AlarmService.scheduleAlarm(
      currentContext,
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
    callback: (p: PomodoroParameters) -> Unit,
    canceledCallback: () -> Unit,
    error: (e: Throwable) -> Unit
  ) {
    performCurrentActivityFetch(updatedPomodoroSettings, { activity, pomoStuffToSend ->
      if (activity.content.activityID == pomoStuffToSend.currentActivity.content.activityID) {
        callback(pomoStuffToSend)
      } else {
        Log.i(ACTIVITY_NAME, "Activities not same, do not start!!!!")
        canceledCallback()
      }
    }) {
      error(it)
    }
  }

  private fun checkRecoveryActivity(
    updatedPomodoroSettings: PomodoroParameters,
    callback: (p: PomodoroParameters) -> Unit,
    canceledCallback: () -> Unit,
    error: (e: Throwable) -> Unit
  ) {
    performCurrentActivityFetch(updatedPomodoroSettings, { activity, pomoStuffToSend ->
      if (isBreak(activity)) {
        callback(pomoStuffToSend)
      } else {
        Log.i(ACTIVITY_NAME, "Activities not same, do not start!!!!")
        canceledCallback()
      }
    }) {
      error(it)
    }
  }

  private fun isBreak(activity: Activity) =
    activity.content.activityID == null &&
      activity.content.name == "RECOVERY"

  private fun performCurrentActivityFetch(
    updatedPomodoroSettings: PomodoroParameters,
    doStuff: (activity: Activity, pomoStuff: PomodoroParameters) -> Unit,
    error: (e: Throwable) -> Unit
  ) {
    getHeaders(updatedPomodoroSettings, { headers, pomoStuffToSend ->
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
        error(it)
      }
    }) {
      error(it)
    }
  }

  private fun setCurrentActivity(
    buildBreak: WritableMap?,
    pomodoroThings: PomodoroParameters,
    callBack: (upDate: PomodoroParameters) -> Unit,
    error: (e: Throwable) -> Unit
  ) {
    getHeaders(pomodoroThings, { headers, pomoStuffToSend ->
      performRequest(
        Request.Builder()
          .headers(headers)
          .url(
            "${pomoStuffToSend.apiURL}/activity"
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
        error(it)
      }
    }) {
      error(it)
    }
  }
}
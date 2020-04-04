package io.unthrottled.sogos.tacmod.pomodoro

import com.auth0.jwt.JWT
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import io.unthrottled.sogos.tacmod.alarm.AlarmParameters
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import io.unthrottled.sogos.tacmod.alarm.NotificationMessage
import io.unthrottled.sogos.tacmod.alarm.VibrationPattern
import okhttp3.*
import okhttp3.Callback
import java.io.BufferedReader
import java.io.IOException
import java.time.Duration
import java.time.Instant
import java.util.*
import java.util.concurrent.Executor

data class SecurityStuff(
    var accessToken: String,
    val refreshToken: String,
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
    val activityID: String
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
    val access_token: String
)

class PomodoroModule(
    private val reactContext: ReactApplicationContext,
    private val executor: Executor
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private val client = OkHttpClient()
    private val gson = Gson()
  }

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
        pomodoroParam.getString("apiURL") ?: "lol nope!!",
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
        pomodoroParam.getMap("securityStuff")?.getString("clientId") ?: "nada",
        pomodoroParam.getMap("securityStuff")?.getString("verificationCode") ?: "nada",
        pomodoroParam.getMap("securityStuff")?.getString("guid") ?: "nada"
    )
  }

  private fun buildActivity(map: ReadableMap?): Activity {
    return Activity(
        map?.getDouble("antecedenceTime")?.toLong() ?: Instant.now().toEpochMilli(),
        ActivityContent(
            map?.getMap("content")?.getString("name") ?: "Lul Dunno",
            map?.getMap("content")?.getString("uuid") ?: "Lul Dunno",
            map?.getMap("content")?.getString("activityID") ?: "Lul Dunno"
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
            setCurrentActivity(buildActivity(moreUpToDatePomoSettings), moreUpToDatePomoSettings) { mostUpToDatePomoSettings ->
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
            if(
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

  private fun getHeaders(updatedPomodoroSettings: PomodoroParameters, function: (Headers, PomodoroParameters) -> Unit) {
    if (isTokenValid(updatedPomodoroSettings.securityStuff.accessToken)) {
      function(
          buildHeaders(updatedPomodoroSettings),
          updatedPomodoroSettings
      )
    } else {
      refreshToken(updatedPomodoroSettings) { refreshPomoSettings ->
        function(
            buildHeaders(refreshPomoSettings),
            refreshPomoSettings
        )
      }
    }
  }

  private fun refreshToken(
      updatedPomodoroSettings: PomodoroParameters,
      function: (refreshedPomo: PomodoroParameters) -> Unit
      // todo: error
  ) {
    performRequest(
        Request.Builder()
            .url(updatedPomodoroSettings.securityStuff.tokenEndpoint)
            .post(
                FormBody.Builder()
                    .add("grant_type", "refreshToken")
                    .add("client_id", updatedPomodoroSettings.securityStuff.clientId)
                    .add("refresh_token", updatedPomodoroSettings.securityStuff.refreshToken)
                    .build()
            )
            .build(),
        {
          val accessTokenResponse = gson.fromJson(it, RefreshTokenResponse::class.java)
          function(
              updatedPomodoroSettings.apply {
                this.securityStuff.accessToken = accessTokenResponse.access_token
              }
          )
        }
    ) {
//      todo: me
    }
  }

  private fun buildHeaders(
      updatedPomodoroSettings: PomodoroParameters
  ): Headers {
    return Headers.Builder()
        .add("User-Identifier", updatedPomodoroSettings.securityStuff.guid)
        .add("Verification", updatedPomodoroSettings.securityStuff.verificationCode)
        .add("Authorization", "Bearer " + updatedPomodoroSettings.securityStuff.accessToken)
        .build()
  }

  private fun isTokenValid(accessToken: String): Boolean {
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

  private fun performRequest(
      request: Request,
      callbutt: (response: String) -> Unit,
      error: (e: Throwable) -> Unit
  ) {
    client.newCall(request).enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) {
        error(e)
      }

      override fun onResponse(call: Call, response: Response) {
        response.use { res ->
          if (res.isSuccessful) {
            res.body()?.charStream()?.use {
              try {
                val reader = BufferedReader(it)
                val stringBuilder = StringBuilder()
                var line: String? = reader.readLine()
                while (line != null) {
                  stringBuilder.append(line)
                  line = reader.readLine()
                }
                callbutt(stringBuilder.toString())
              } catch (e: Throwable) {
                error(e)
              }
            }
          } else {
            error(
                RuntimeException(
                    "Shit did not work, returned ${res.code().toString()}"
                )
            )
          }
        }
      }
    })
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
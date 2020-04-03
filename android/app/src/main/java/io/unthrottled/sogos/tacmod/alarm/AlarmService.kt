package io.unthrottled.sogos.tacmod.alarm

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.unthrottled.sogos.tacmod.R
import java.time.Instant
import java.util.*
import kotlin.collections.HashSet

object AlarmService {
  private var previousNotificationId: Int = 69
  private lateinit var reactContextSupplier: () -> ReactApplicationContext
  private var listener: () -> Unit = {}

  private const val ID = "tacmod_alarm_id"
  private const val NOTIFICATION = "tacmod_notification"
  const val NOTIFICATION_CHANNEL_ID = "TacModNotifications"


  private val ranbo = Random(SystemClock.elapsedRealtime())
  private val scheduledNotifications = HashSet<Int>()

  fun scheduleAlarm(reactContext: ReactApplicationContext, alarmParameters: ReadableMap) {
    stopItGetSomeHelp(reactContext)
    val notification = NotificationCompat.Builder(
        reactContext.applicationContext,
        NOTIFICATION_CHANNEL_ID
    )
        .setContentTitle(alarmParameters.getMap("message")?.getString("title"))
        .setContentText(alarmParameters.getMap("message")?.getString("message"))
        .setAutoCancel(true)
        .setSmallIcon(R.mipmap.status_icon)
        .setLargeIcon(BitmapFactory.decodeResource(
            reactContext.resources,
            R.mipmap.ic_launcher
        ))
        .setSound(
            RingtoneManager.getDefaultUri(
                RingtoneManager.TYPE_NOTIFICATION
            )
        )
        .setVibrate(buildVibrationPattern(alarmParameters))
        .build()

    val notificationId = generateNotificationId()

    val alarmIntent = Intent(reactContext.applicationContext, AlarmReceiver::class.java)
    alarmIntent.putExtra(
        ID,
        notificationId
    )
    alarmIntent.putExtra(
        NOTIFICATION,
        notification
    )
    val pendingAlarmIntent = buildPendingIntent(reactContext, notificationId, alarmIntent)

    val alarmManager = reactContext.applicationContext.getSystemService(
        Context.ALARM_SERVICE
    ) as AlarmManager

    val setTime = alarmParameters.getDouble("timeToAlert").toLong()
    val currentTime = Instant.now().toEpochMilli()
    alarmManager.setAndAllowWhileIdle(
        AlarmManager.ELAPSED_REALTIME_WAKEUP,
        SystemClock.elapsedRealtime() + (setTime - currentTime),
        pendingAlarmIntent
    )
  }

  private fun buildVibrationPattern(alarmParameters: ReadableMap) =
      when(getVibrationPattern(alarmParameters)){
        "shortBreak" -> longArrayOf(0, 100, 120, 500)
        "longBreak"-> longArrayOf(5000)
        else -> longArrayOf(200, 100, 300, 150, 500)
      }

  private fun getVibrationPattern(alarmParameters: ReadableMap) =
      if(alarmParameters.hasKey("vibrationPattern")){
        alarmParameters.getString("vibrationPattern")
      } else {
        "all your base"
      }

  private fun buildPendingIntent(reactContext: ReactApplicationContext, notificationId: Int, alarmIntent: Intent): PendingIntent? {
    return PendingIntent.getBroadcast(
        reactContext.applicationContext,
        notificationId,
        alarmIntent,
        PendingIntent.FLAG_CANCEL_CURRENT
    )
  }

  private fun generateNotificationId(): Int {
    val id = ranbo.nextInt()
    return if (!scheduledNotifications.add(id)) {
      generateNotificationId()
    } else {
      id
    }
  }

  fun stopItGetSomeHelp(reactContext: ReactApplicationContext) {
    scheduledNotifications
        .map {
          buildPendingIntent(
              reactContext,
              it,
              Intent(reactContext.applicationContext, AlarmReceiver::class.java)
          )
        }.forEach {
          alarmManager(reactContext).cancel(it)
        }
    scheduledNotifications.clear()
    listener = {}
  }

  private fun alarmManager(reactContext: ReactApplicationContext): AlarmManager {
    return reactContext.getSystemService(
        Context.ALARM_SERVICE
    ) as AlarmManager
  }

  fun dispatchNotification(context: Context, intent: Intent) {
    val notificationManager = context.getSystemService(
        Context.NOTIFICATION_SERVICE
    ) as NotificationManager
    val notificationId = intent.getIntExtra(ID, 0)
    val notification = intent.getParcelableExtra<Notification>(
        NOTIFICATION
    )
    notificationManager.notify(
        notificationId,
        notification
    )
    notificationManager.cancel(previousNotificationId)
    previousNotificationId = notificationId

    scheduledNotifications.remove(notificationId)

    listener()
    if(this::reactContextSupplier.isInitialized){
      reactContextSupplier().getJSModule(
          DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
      ).emit(
          "CompletedPomodoro",
          Arguments.createMap()
      )
    }
  }

  fun setCompletionListener(completionListener: () -> Unit){
    this.listener = completionListener
  }

  fun setReactContextSupplier(
      reactContextSupplier: () -> ReactApplicationContext
  ) {
    this.reactContextSupplier = reactContextSupplier
  }
}
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
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import io.unthrottled.sogos.tacmod.R
import java.util.*
import kotlin.collections.HashSet

object AlarmService {
  private const val ID = "tacmod_alarm_id"
  private const val NOTIFICATION = "tacmod_notification"
  const val NOTIFICATION_CHANNEL_ID = "TacModNotifications"

  private val ranbo = Random(SystemClock.elapsedRealtime())
  private val scheduledNotifications = HashSet<Int>()

  fun scheduleAlarm(reactContext: ReactApplicationContext, alarmParameters: ReadableMap) {
    println("finna set an alarm to this $alarmParameters")
    val notification = NotificationCompat.Builder(
        reactContext.applicationContext,
        NOTIFICATION_CHANNEL_ID
    )
        .setContentTitle(alarmParameters.getMap("message")?.getString("title"))
        .setContentText(alarmParameters.getMap("message")?.getString("message"))
        .setAutoCancel(true)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setLargeIcon(BitmapFactory.decodeResource(
            reactContext.resources,
            R.mipmap.ic_launcher
        ))
        .setSound(
            RingtoneManager.getDefaultUri(
                RingtoneManager.TYPE_NOTIFICATION
            )
        )
        .setVibrate(longArrayOf(100, 200, 300, 200, 100, 200, 300))
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

    alarmManager.set(
        AlarmManager.ELAPSED_REALTIME_WAKEUP,
        SystemClock.elapsedRealtime() + 5000,
        pendingAlarmIntent
    )
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

  fun stopAllAlarms(reactContext: ReactApplicationContext) {
    println("finna stop all the alarms")
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
  }

  private fun alarmManager(reactContext: ReactApplicationContext): AlarmManager {
    return reactContext.getSystemService(
        Context.ALARM_SERVICE
    ) as AlarmManager
  }

  fun dispatchNotification(context: Context, intent: Intent) {
    println("Ahh shit, here we go.")
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

    scheduledNotifications.remove(notificationId)
  }
}
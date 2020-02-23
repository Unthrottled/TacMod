package io.unthrottled.sogos.tacmod.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import io.unthrottled.sogos.tacmod.NOTIFICATION_CHANNEL_ID
import io.unthrottled.sogos.tacmod.R
import java.time.Instant
import java.util.*

class AlarmModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "Alarm"

  @ReactMethod
  fun stopAllAlarms() {
    println("finna stop all the alarms")
  }

  @ReactMethod
  fun setAlarm(alarmParameters: ReadableMap) {
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
    val alarmIntent = Intent(reactContext.applicationContext, AlarmReceiver::class.java)
    alarmIntent.putExtra(
        AlarmReceiver.ID,
        UUID.randomUUID().toString()
    )
    alarmIntent.putExtra(
        AlarmReceiver.NOTIFICATION,
        notification
    )

    val pendingAlarmIntent = PendingIntent.getBroadcast(
        reactContext.applicationContext,
        Instant.now().epochSecond.toInt(),
        alarmIntent,
        PendingIntent.FLAG_CANCEL_CURRENT
    )

    val alarmManager = reactContext.applicationContext.getSystemService(
        Context.ALARM_SERVICE
    ) as AlarmManager

    alarmManager.set(
        AlarmManager.ELAPSED_REALTIME_WAKEUP,
        SystemClock.elapsedRealtime() + 5000,
        pendingAlarmIntent
    )
  }
}
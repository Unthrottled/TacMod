package io.unthrottled.tacmod.alarm

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
import io.unthrottled.tacmod.R
import java.time.Instant
import java.util.*
import kotlin.collections.HashSet

data class NotificationMessage(
    val title: String,
    val message: String
)

enum class VibrationPattern {
    SHORT, LONG, RESUME
}

data class AlarmParameters(
    val notification: NotificationMessage,
    val timeToAlert: Long,
    val vibrationPattern: VibrationPattern
)

object AlarmService {
    private var previousNotificationId: Int = 69
    private const val ID = "tacmod_alarm_id"
    private const val NOTIFICATION = "tacmod_notification"
    const val NOTIFICATION_CHANNEL_ID = "TacModNotifications"


    private val ranbo = Random(SystemClock.elapsedRealtime())
    private val scheduledNotifications = HashSet<Int>()

    fun scheduleAlarm(applicationContext: Context, alarmParameters: AlarmParameters) {
        stopAllAlarms(applicationContext)
        val notification = NotificationCompat.Builder(
            applicationContext,
            NOTIFICATION_CHANNEL_ID
        )
            .setContentTitle(alarmParameters.notification.title)
            .setContentText(alarmParameters.notification.message)
            .setAutoCancel(true)
            .setSmallIcon(R.mipmap.status_icon)
            .setLargeIcon(
                BitmapFactory.decodeResource(
                    applicationContext.resources,
                    R.mipmap.ic_launcher
                )
            )
            .setSound(
                RingtoneManager.getDefaultUri(
                    RingtoneManager.TYPE_NOTIFICATION
                )
            )
            .setVibrate(buildVibrationPattern(alarmParameters))
            .build()

        val notificationId = generateNotificationId()

        val alarmIntent = Intent(applicationContext, AlarmReceiver::class.java)
        alarmIntent.putExtra(
            ID,
            notificationId
        )
        alarmIntent.putExtra(
            NOTIFICATION,
            notification
        )
        val pendingAlarmIntent = buildPendingIntent(applicationContext, notificationId, alarmIntent)

        val alarmManager = applicationContext.getSystemService(
            Context.ALARM_SERVICE
        ) as AlarmManager

        val setTime = alarmParameters.timeToAlert
        val currentTime = Date().time
        alarmManager.setAndAllowWhileIdle(
            AlarmManager.ELAPSED_REALTIME_WAKEUP,
            SystemClock.elapsedRealtime() + (setTime - currentTime),
            pendingAlarmIntent
        )
    }

    private fun buildVibrationPattern(alarmParameters: AlarmParameters) =
        when (alarmParameters.vibrationPattern) {
            VibrationPattern.SHORT -> longArrayOf(0, 100, 120, 500)
            VibrationPattern.LONG -> longArrayOf(5000)
            else -> longArrayOf(200, 100, 300, 150, 500)
        }


    private fun buildPendingIntent(
        context: android.content.Context,
        notificationId: Int,
        alarmIntent: Intent
    ): PendingIntent? {
        return PendingIntent.getBroadcast(
            context.applicationContext,
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

    fun stopAllAlarms(context: Context) {
        scheduledNotifications
            .map {
                buildPendingIntent(
                    context,
                    it,
                    Intent(context.applicationContext, AlarmReceiver::class.java)
                )
            }.forEach {
                alarmManager(context).cancel(it)
            }
        scheduledNotifications.clear()
    }

    private fun alarmManager(context: Context): AlarmManager {
        return context.getSystemService(
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

    }

}
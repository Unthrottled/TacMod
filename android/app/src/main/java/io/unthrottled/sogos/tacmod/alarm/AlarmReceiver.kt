package io.unthrottled.sogos.tacmod.alarm

import android.app.Notification
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import java.time.Instant

class AlarmReceiver: BroadcastReceiver() {
    companion object {
        const val ID = "tacmod_alarm_id"
        const val NOTIFICATION = "tacmod_notification"
    }
    override fun onReceive(context: Context, intent: Intent) {
        println("Ahh shit, here we go.")
        val notificationManager = context.getSystemService(
            Context.NOTIFICATION_SERVICE
        ) as NotificationManager

        val notification = intent.getParcelableExtra<Notification>(
            NOTIFICATION
        )
        notificationManager.notify(
            Instant.now().epochSecond.toInt(),
            notification
        )
    }
}
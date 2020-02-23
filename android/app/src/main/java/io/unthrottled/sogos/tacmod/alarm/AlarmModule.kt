package io.unthrottled.sogos.tacmod.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
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
        val alarmIntent = Intent(reactContext.applicationContext, AlarmReceiver::class.java)
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
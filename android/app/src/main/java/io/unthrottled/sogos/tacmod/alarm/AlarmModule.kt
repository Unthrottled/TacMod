package io.unthrottled.sogos.tacmod.alarm

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import okhttp3.OkHttpClient

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "Alarm"

    companion object {
        private val client = OkHttpClient()
    }

    @ReactMethod
    fun stopAllAlarms() {
        println("finna stop all the alarms")
    }

    @ReactMethod
    fun setAlarm(alarmParameters: ReadableMap) {
        println("finna set an alarm to this $alarmParameters")
    }
}
package io.unthrottled.sogos.tacmod.alarm

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class AlarmModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  init {
    AlarmService.setReactContext(reactContext)
  }

  override fun getName(): String = "Alarm"

  @ReactMethod
  fun stopAllAlarms() {
    AlarmService.stopAllAlarms(reactContext)
  }

  @ReactMethod
  fun setAlarm(alarmParameters: ReadableMap) {
    AlarmService.scheduleAlarm(
        reactContext,
        alarmParameters
    )
  }
}
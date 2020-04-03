package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class PomodoroModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {


  override fun getName(): String = "Pomodoro"

  @ReactMethod
  fun stopAllAlarms() {
  }

  @ReactMethod
  fun setAlarm(alarmParameters: ReadableMap) {
  }
}
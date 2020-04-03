package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.concurrent.Executor

class PomodoroModule(
    private val reactContext: ReactApplicationContext,
    private val executor: Executor
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "Pomodoro"

  @ReactMethod
  fun initializeSecurity() {

  }

  @ReactMethod
  fun setAlarm(alarmParameters: ReadableMap) {

  }
}
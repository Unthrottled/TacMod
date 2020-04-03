package io.unthrottled.sogos.tacmod.pomodoro

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import io.unthrottled.sogos.tacmod.alarm.AlarmService
import java.util.concurrent.Executor

class PomodoroModule(
    private val reactContext: ReactApplicationContext,
    private val executor: Executor
) : ReactContextBaseJavaModule(reactContext) {

  init {
    AlarmService.setReactContextSupplier {
      reactContext
    }
  }
  override fun getName(): String = "Pomodoro"

  @ReactMethod
  fun commencePomodoroForActivity(pomodoroThings: ReadableMap) {

  }

  @ReactMethod
  fun stopItGetSomeHelp(){
    AlarmService.stopItGetSomeHelp(reactContext)
  }
}